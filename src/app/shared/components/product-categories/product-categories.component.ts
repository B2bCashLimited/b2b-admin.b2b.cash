import { Component, OnDestroy, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { MatDialog, MatTreeFlatDataSource, MatTreeFlattener, MatDialogRef } from '@angular/material';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, takeUntil } from 'rxjs/operators';
import { AddCategoryDialogComponent } from './dialogs/add-category-dialog/add-category-dialog.component';
import { MoveCategoryDialogComponent } from './dialogs/move-category-dialog/move-category-dialog.component';
import { CategoryService } from '@b2b/services/category.service';
import { FlatTreeControl } from '@angular/cdk/tree';
import { FormControl } from '@angular/forms';
import { ConfigService } from '@b2b/services/config.service';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog/confirm-dialog.component';
import { cloneDeep } from 'lodash';
import { Subject } from 'rxjs';
import { CsvTypeChooseComponent } from '@b2b/shared/dialogs';
import { IconEditDialogComponent } from './dialogs/icon-edit-dialog/icon-edit-dialog.component';

class CategoryNode {
  children?: CategoryNode[];
  hasChildren?: boolean;
  id: number;
  nameCn: string;
  nameEn: string;
  nameRu: string;
  parentId?: string;
  iconImage?: string;
  path: string;
  status: number;
}

class CategoryFlatNode {
  expandable: boolean;
  id: number;
  level: number;
  nameCn: string;
  nameEn: string;
  nameRu: string;
  parentId?: string;
  iconImage?: string;
  path: string;
  status: number;
}

@Component({
  selector: 'b2b-product-categories',
  templateUrl: './product-categories.component.html',
  styleUrls: ['./product-categories.component.scss'],
})
export class ProductCategoriesComponent implements OnInit, OnDestroy {

  isLoading = false;
  formControl = new FormControl({ value: null, disabled: true });
  flatNodeMap = new Map<CategoryFlatNode, CategoryNode>();
  nestedNodeMap = new Map<CategoryNode, CategoryFlatNode>();
  treeControl: FlatTreeControl<CategoryFlatNode>;
  treeFlattener: MatTreeFlattener<CategoryNode, CategoryFlatNode>;
  dataSource: MatTreeFlatDataSource<CategoryNode, CategoryFlatNode>;
  filteredTreeData: any[] = [];
  treeControlFlatNodesCopy: CategoryFlatNode[];
  @Output() createdCategory = new EventEmitter<any>(null);

  private _categories: any;
  private _categoriesTree: CategoryNode[];
  private _unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private _matDialog: MatDialog,
    private _configService: ConfigService,
    private _categoryService: CategoryService) {
  }

  getLevel = (node: CategoryFlatNode) => node.level;

  isExpandable = (node: CategoryFlatNode) => node.expandable;

  getChildren = (node: CategoryNode): CategoryNode[] => node.children;

  hasChild = (_: number, nodeData: CategoryFlatNode) => nodeData.expandable;

  ngOnInit(): void {
    this._initCategoriesTree();
  }

  ngOnDestroy(): void {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }

  onEditIconClick(category) {
    this._matDialog.open(IconEditDialogComponent, {
      data: category,
      autoFocus: false
    });
  }

  transformer(node: CategoryNode, level: number) {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.nameRu === node.nameRu
      ? existingNode
      : new CategoryFlatNode();
    flatNode.nameCn = node.nameCn;
    flatNode.nameEn = node.nameEn;
    flatNode.nameRu = node.nameRu;
    flatNode.status = node.status;
    flatNode.iconImage = node.iconImage;
    flatNode.id = node.id;
    flatNode.level = level;
    flatNode.path = node.path;
    flatNode.expandable = !!node.hasChildren;

    if (node.parentId) {
      flatNode.parentId = node.parentId;
    }

    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  onExpandCategoryClick(node): void {
    if (this.treeControl.isExpanded(node)) {
      this.treeControl.collapse(node);
    } else {
      this.treeControl.expand(node);
    }
  }

  onAddCategoryClick(evt: MouseEvent, category: CategoryFlatNode): void {
    evt.stopPropagation();

    this._matDialog.open(AddCategoryDialogComponent, {
      width: '500px',
      data: {
        categoryId: category.id
      },
      disableClose: true,
    }).afterClosed()
      .pipe(
        filter((res) => res && !!res),
        switchMap((res: any) => {
          return this._categoryService.addCategory({ ...res, parent: category.id })
            .pipe(
              map((data: any) => {
                res.id = data.id;
                const parentNode = this.flatNodeMap.get(category);
                this._insertItem(parentNode, res);
                this.treeControl.expand(category);
                this.createdCategory.next(data);
              })
            );
        })
      )
      .subscribe();
  }

  onFilterValueChanged(): void {
    this.formControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this._unsubscribe$)
      )
      .subscribe((value: string) => {
        if (!value) {
          this.dataSource.data = this._buildFileTree(this._categories);

          if (!this.treeControlFlatNodesCopy) {
            this.treeControlFlatNodesCopy = cloneDeep(this.treeControl.dataNodes);
          }

          this.treeControl.collapseAll();
        } else {
          this.filterCategories(value);
        }
      });
  }

  filterCategories(value: string): void {
    this.filteredTreeData = this.treeControlFlatNodesCopy.filter(node => {
      return node.nameRu.toUpperCase().indexOf(value.toUpperCase()) > -1;
    });

    Object.assign([], this.filteredTreeData)
      .forEach(ftd => {
        let str = ftd.path;

        while (str.lastIndexOf('.') > -1) {
          const index = str.lastIndexOf('.');
          str = str.substring(0, index);

          if (this.filteredTreeData.findIndex(t => t.path === str) === -1) {
            const obj = this.treeControlFlatNodesCopy.find(d => d.path === str);

            if (obj) {
              this.filteredTreeData.push(obj);
            }
          }
        }
      });

    if (this.filteredTreeData) {
      this.dataSource.data = this._buildFileTree(this.filteredTreeData, null, null, true, '0');

      if (!this.treeControlFlatNodesCopy) {
        this.treeControlFlatNodesCopy = cloneDeep(this.treeControl.dataNodes);
      }

      this.treeControl.expandAll();
    }
  }

  onEditCategoryClick(evt: MouseEvent, category: CategoryFlatNode): void {
    evt.stopPropagation();

    this._matDialog.open(AddCategoryDialogComponent, {
      width: '500px',
      disableClose: true,
      data: { category }
    }).afterClosed()
      .pipe(
        filter((res: any) => res && !!res),
        switchMap((body: any) => this._categoryService.updateCategory(category.id, body))
      )
      .subscribe((body: any) => {
        category.nameCn = body.nameCn;
        category.nameEn = body.nameEn;
        category.nameRu = body.nameRu;
        category.iconImage = body.iconImage;
        const index = this.treeControlFlatNodesCopy.findIndex(item => item.id === category.id);
        this.treeControlFlatNodesCopy[index].nameCn = body.nameCn;
        this.treeControlFlatNodesCopy[index].nameEn = body.nameEn;
        this.treeControlFlatNodesCopy[index].nameRu = body.nameRu;
        this.treeControlFlatNodesCopy[index].iconImage = body.iconImage;
      });
  }

  onMoveCategoryClick(evt: MouseEvent, category: CategoryFlatNode): void {
    evt.stopPropagation();

    this._matDialog.open(MoveCategoryDialogComponent, {
      width: '1200px',
      disableClose: true,
      data: { category }
    }).afterClosed()
      .pipe(filter((add) => !!add))
      .subscribe(() => {
        this._initCategoriesTree();
        this.treeControlFlatNodesCopy = cloneDeep(this.treeControl.dataNodes);
      });
  }

  onDestroyCategoryClick(evt: MouseEvent, category: CategoryFlatNode): void {
    evt.stopPropagation();

    this._matDialog.open(ConfirmDialogComponent, {
      width: '500px',
      disableClose: true,
      data: { category }
    }).afterClosed()
      .pipe(
        filter((res: boolean) => res),
        switchMap(() => this._categoryService.destroyCategory(category.id))
      )
      .subscribe(() => {
        this.getNodeIndexFromList(category, this._categoriesTree);
        this.dataSource.data = [...this._categoriesTree];
        this.treeControlFlatNodesCopy = this.treeControlFlatNodesCopy
          .filter(item => +item.id !== +category.id);
      });
  }

  onAddNewCategoryClick(): void {
    this._matDialog.open(AddCategoryDialogComponent, {
      width: '600px',
      maxHeight: '90vh',
      data: {},
      disableClose: true,
    }).afterClosed()
      .pipe(
        filter((res) => res && !!res),
        switchMap((res) => {
          return this._categoryService.addCategory(res)
            .pipe(
              map((data: any) => {
                res.id = data.id;
                this._insertItem(null, res);
                this.createdCategory.next(data);
              })
            );
        })
      ).subscribe();
  }

  downloadCsv(evt: any, category: any): void {
    evt.stopPropagation();
    this._matDialog.open(CsvTypeChooseComponent, {
      width: '600px',
      height: '700px',
      data: {
        categoryId: category.id,
        simple: false
      }
    });
  }

  /**
   * Initializes categories tree, sets controls, data source of categories tree
   */
  private _initCategoriesTree(): void {
    this.treeFlattener = new MatTreeFlattener(this.transformer.bind(this), this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<CategoryFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.isLoading = true;
    this._getCategoriesTree();
    this.onFilterValueChanged();
  }

  /**
   * Retrieves categories tree
   */
  private _getCategoriesTree(): void {
    this._categoryService.getCategoriesTree()
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe((res) => {
        this.isLoading = false;
        this.formControl.enable();
        this._categories = this._addPathToCategories(res);
        this._categoriesTree = this._buildFileTree(this._categories);
        this.dataSource.data = this._categoriesTree;

        if (!this.treeControlFlatNodesCopy) {
          this.treeControlFlatNodesCopy = cloneDeep(this.treeControl.dataNodes);
        }
      });
  }

  private _insertItem(parent: CategoryNode, category: any): void {
    const categoryNode = this._buildFileTree([category]).pop();

    if (parent) {
      categoryNode.path = parent.path + '.' + (parent.children.length + 1).toString();
      const parentTree = this._categoriesTree.find(item => +item.id === +parent.id);

      if (!parentTree.children) {
        parentTree.children = [];
        parentTree.hasChildren = true;
      }

      parentTree.children.push(categoryNode);
      this.dataSource.data = [...this._categoriesTree];

      if (!this.treeControlFlatNodesCopy) {
        this.treeControlFlatNodesCopy = cloneDeep(this.treeControl.dataNodes);
      }
    } else {
      const lastPath = this._categoriesTree[this._categoriesTree.length - 1].path;
      const lastCategoryNumber = lastPath.substr(lastPath.indexOf('.') + 1);

      categoryNode.path = '0.' + (+lastCategoryNumber + 1).toString();
      this._categories.push(category);
      this.dataSource.data = this._buildFileTree(this._categories);

      if (!this.treeControlFlatNodesCopy) {
        this.treeControlFlatNodesCopy = cloneDeep(this.treeControl.dataNodes);
      }
    }
  }

  private _buildFileTree(arr: any[] = [], level: number = 0, parentId?: string, isFilter?: boolean, path?: string): CategoryNode[] {
    if (isFilter) {
      return arr.filter(item => item.path.startsWith(path + '.')
        && ((<string>item.path).match(/\./g) || []).length === (path.match(/\./g) || []).length + 1)
        .map(current => {
          const node = new CategoryNode();
          node.nameCn = current.nameCn;
          node.nameEn = current.nameEn;
          node.nameRu = current.nameRu;
          node.iconImage = current.iconImage;
          node.status = current.status;
          node.id = current.id;
          node.path = current.path;

          if (parentId) {
            node.parentId = parentId;
          }

          const children = arr.filter(item => (<string>item.path).startsWith(path + '.'));

          if (children && children.length > 0) {
            node.hasChildren = arr.some(item => (<string>item.path).startsWith((<string>node.path) + '.'));
            node.children = this._buildFileTree(children, null, current.id, true, current.path);
          } else {
            node.hasChildren = true;
          }

          return node;
        });
    } else {
      return arr.reduce<CategoryNode[]>((accumulator, current) => {
        const node = new CategoryNode();
        node.nameCn = current.nameCn;
        node.nameEn = current.nameEn;
        node.nameRu = current.nameRu;
        node.iconImage = current.iconImage;
        node.status = current.status;
        node.id = current.id;
        node.path = current.path;

        if (parentId) {
          node.parentId = parentId;
        }

        if (current.children && current.children.length) {
          node.hasChildren = true;
          node.children = this._buildFileTree(current.children, level + 1, current.id);
        }

        return accumulator.concat(node);
      }, []);
    }
  }

  private getNodeIndexFromList(nestedNode: CategoryNode, categoryNodes: CategoryNode[]): void {
    for (let i = 0; i < categoryNodes.length; i++) {
      const node = categoryNodes[i];

      if (+node.id === +nestedNode.id) {
        delete categoryNodes[i];
        break;
      } else if (node.children) {
        this.getNodeIndexFromList(nestedNode, node.children);
      }
    }
  }

  /**
   * Adds path to categories (needs to use in filtering)
   */
  private _addPathToCategories(categories: any[], path: number = 0): any[] {
    for (let i = 0; i < categories.length; i++) {
      const obj = categories[i];
      obj.path = `${path}.${i + 1}`;
      const children = obj.children || [];

      if (children.length > 0) {
        this._addPathToCategories(children, obj.path);
      }
    }

    return categories;
  }

}
