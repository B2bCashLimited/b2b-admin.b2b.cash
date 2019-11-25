import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormGroup } from '@angular/forms';
import { CategoryService } from '@b2b/services/category.service';
import { FormControl } from '@angular/forms';
import { ConfigService } from '@b2b/services/config.service';
import { FlatTreeControl } from '@angular/cdk/tree';
import { cloneDeep } from 'lodash';
import { Subject } from 'rxjs';

class CategoryNode {
  children?: CategoryNode[];
  hasChildren?: boolean;
  id: number;
  nameCn: string;
  nameEn: string;
  nameRu: string;
  parentId?: string;
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
  path: string;
  status: number;
}

@Component({
  selector: 'b2b-move-category-dialog',
  templateUrl: './move-category-dialog.component.html',
  styleUrls: ['./move-category-dialog.component.scss']
})

export class MoveCategoryDialogComponent implements OnInit, OnDestroy {

  formGroup: FormGroup;
  isLoading = false;
  formControl = new FormControl({value: null, disabled: true});
  flatNodeMap = new Map<CategoryFlatNode, CategoryNode>();
  nestedNodeMap = new Map<CategoryNode, CategoryFlatNode>();
  treeControl: FlatTreeControl<CategoryFlatNode>;
  treeFlattener: MatTreeFlattener<CategoryNode, CategoryFlatNode>;
  dataSource: MatTreeFlatDataSource<CategoryNode, CategoryFlatNode>;
  filteredTreeData: any[] = [];
  treeControlFlatNodesCopy: CategoryFlatNode[];
  nodeId = 0;
  fromIdCat = 0;
  toIdCat = 0;
  selectedCategory = this._dialogData.category;

  private _categories: any;
  private _categoriesTree: CategoryNode[];
  private _unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    @Inject(MAT_DIALOG_DATA) private _dialogData: any,
    private _matDialogRef: MatDialogRef<MoveCategoryDialogComponent>,
    private _configService: ConfigService,
    private _categoryService: CategoryService) {
  }

  getLevel = (node: CategoryFlatNode) => node.level;

  isExpandable = (node: CategoryFlatNode) => node.expandable;

  getChildren = (node: CategoryNode): CategoryNode[] => node.children;

  hasChild = (_: number, nodeData: CategoryFlatNode) => nodeData.expandable;

  ngOnInit(): void {
    this.updateCategoriesTree();
  }

  ngOnDestroy(): void {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
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

  categoryWithoutChildrenClicked(node): void {
    this.nodeId = this.toIdCat = node.id;
  }

  onExpandCategoryClick(node): void {
    this.nodeId = this.toIdCat = node.id;

    if (this.treeControl.isExpanded(node)) {
      this.treeControl.collapse(node);
    } else {
      this.treeControl.expand(node);
    }
  }

  /**
   * Move category to other category
   */
  onMoveCategoryClick(fromIdCat: number, toIdCat: number) {
    if (fromIdCat > 0 && toIdCat > 0 && fromIdCat !== toIdCat) {
      this._categoryService.moveCategory(fromIdCat, toIdCat)
        .pipe(takeUntil(this._unsubscribe$))
        .subscribe(() => this._matDialogRef.close(true));
    }
  }

  /**
   * Fires on close button click
   */
  onCloseClick(add: boolean): void {
    this._matDialogRef.close(add);
  }

  onFilterValueChanged(): void {
    this.formControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this._unsubscribe$),
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

  private updateCategoriesTree(): void {
    this.fromIdCat = this.selectedCategory.id;
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
      .subscribe((res: any[]) => {
        res = res.filter(item => item.id !== this.fromIdCat);
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

  private _buildFileTree(arr: any[] = [], level: number = 0, parentId?: string, isFilter?: boolean, path?: string): CategoryNode[] {
    if (isFilter) {
      return arr.filter(item => item.path.startsWith(path + '.')
        && ((<string>item.path).match(/\./g) || []).length === (path.match(/\./g) || []).length + 1)
        .map(current => {
          const node = new CategoryNode();
          node.nameCn = current.nameCn;
          node.nameEn = current.nameEn;
          node.nameRu = current.nameRu;
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
          }

          return node;
        });
    } else {
      return arr.reduce<CategoryNode[]>((accumulator, current) => {
        const node = new CategoryNode();
        node.nameCn = current.nameCn;
        node.nameEn = current.nameEn;
        node.nameRu = current.nameRu;
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
