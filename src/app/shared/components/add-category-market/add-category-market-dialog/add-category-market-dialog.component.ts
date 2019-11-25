import { Component, Inject, OnInit, Injectable } from '@angular/core';
import { MAT_DIALOG_DATA, MatChipInputEvent, MatDialogRef, MatDialog, MatTreeFlattener, MatTreeFlatDataSource } from '@angular/material';
import { BehaviorSubject, Subject } from 'rxjs';
import { FlatTreeControl } from '@angular/cdk/tree';
import { SelectionModel } from '@angular/cdk/collections';
import { MarketplaceService } from '@b2b/services/marketplace.service';
import { find, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { cloneDeep } from 'lodash';


export class TodoItemNode {
  children?: TodoItemNode[];
  parentId?: any;
  hasChildren?: boolean;
  autoForm: boolean;
  dateCreated: any;
  enabled: boolean;
  googleCategoryId: number;
  iconClass: any;
  iconClassColor: any;
  iconImage: any;
  id: number;
  nameCn: string;
  nameEn: string;
  nameRu: string;
  nameRuTransliterated: string;
  orderForm: any;
  pId: any;
  path: string;
  proposedByCompany: any;
  status: number;
  viewedByModerator: boolean;
  yandexCategoryId: number;
  _embedded: LevelTwoEmbeded;
}

export class TodoItemCaegory {
  id: number;
  parent: any;
  priority: number;
  visible: boolean;
  _embedded: LevelOneEmbeded;
}

export class LevelOneEmbeded {
  category: CategoryNode;
  marketplace: any;
  site: any;
}

export class CategoryNode {
  children?: CategoryNode[];
  hasChildren?: boolean;
  parentId?: any;
  autoForm: boolean;
  dateCreated: any;
  enabled: boolean;
  googleCategoryId: number;
  iconClass: any;
  iconClassColor: any;
  iconImage: any;
  id: number;
  nameCn: string;
  nameEn: string;
  nameRu: string;
  nameRuTransliterated: string;
  orderForm: any;
  pId: any;
  path: string;
  proposedByCompany: any;
  status: number;
  viewedByModerator: boolean;
  yandexCategoryId: number;
  _embedded: LevelTwoEmbeded;
}

export class LevelTwoEmbeded {
  categories: any[];
  etsngs: any[];
  orderPreview: any;
  parent: CategoryNode;
  properties: any[];
  tnveds: any[];
}

/** Flat to-do item node with expandable and level information */
export class TodoItemFlatNode {
  level: number;
  parentId: any;
  expandable: boolean;
  autoForm: boolean;
  dateCreated: any;
  enabled: boolean;
  googleCategoryId: number;
  iconClass: any;
  iconClassColor: any;
  iconImage: any;
  id: number;
  nameCn: string;
  nameEn: string;
  nameRu: string;
  nameRuTransliterated: string;
  orderForm: any;
  pId: any;
  path: string;
  proposedByCompany: any;
  status: number;
  viewedByModerator: boolean;
  yandexCategoryId: number;
  _embedded: LevelTwoEmbeded;
}

@Component({
  selector: 'b2b-add-category-market-dialog',
  templateUrl: './add-category-market-dialog.component.html',
  styleUrls: ['./add-category-market-dialog.component.scss']
})
export class AddCategoryMarketDialogComponent implements OnInit {

  dataChange = new BehaviorSubject<TodoItemNode[]>([]);
  dataCategory: any[] = [];
  public category: any;
  public sendCategory: any[];
  private _categories: any;
  public isLoading: boolean;
  public market: any;
  filteredTreeData: any[] = [];
  treeControlFlatNodesCopy: TodoItemFlatNode[];
  private _unsubscribe$: Subject<void> = new Subject<void>();
  private _categoriesTree: TodoItemNode[];
  treeControl: FlatTreeControl<TodoItemFlatNode>;
  formControl = new FormControl({value: null, disabled: false});
  treeFlattener: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;
  dataSource: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;
  flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();
  nestedNodeMap = new Map<TodoItemNode, TodoItemFlatNode>();
  selectedParent: TodoItemFlatNode | null = null;
  /** The new item's name */
  newItemName = '';
  /** The selection for checklist */
  checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* multiple */);

  get data(): TodoItemNode[] { return this.dataChange.value; }

  constructor(private _matDialogRef: MatDialogRef<AddCategoryMarketDialogComponent>,
    private _matDialog: MatDialog,
    private marketService: MarketplaceService,
    @Inject(MAT_DIALOG_DATA) private _dialogData: any
    ) {
      this.isLoading = true;
      this.marketService.getAllCategory().subscribe(next => {
        this.dataCategory = next;
        this.isLoading = false;
        this.initialize();
      });
      this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
      this.isExpandable, this.getChildren);
      this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
      this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
      this._categories = this._addPathToCategories(this.dataCategory);
      this._categoriesTree = this._buildFileTree(this._categories);
      this.dataSource.data = this._categoriesTree;
      this.dataChange.subscribe(data => {
        this.dataSource.data = data;
      });
     }

  ngOnInit() {
    this.category = this._dialogData.categories;
    this.market = this._dialogData.marketplace;
    this.onFilterValueChanged();
  }

  getLevel = (node: TodoItemFlatNode) => node.level;

  isExpandable = (node: TodoItemFlatNode) => node.expandable;

  getChildren = (node: TodoItemNode): TodoItemNode[] => node.children;

  hasChild = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.nameRu === '';

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: TodoItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.nameRu === node.nameRu
      ? existingNode
      : new TodoItemFlatNode();
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

  /** Whether all the descendants of the node are selected */
  descendantsAllSelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    return descendants.every(child => this.checklistSelection.isSelected(child));
  }

  initialize() {
    // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
    //     file node as children.
    const categoryPath = this._addPathToCategories(this.dataCategory);
    const data = this._buildFileTree(categoryPath);

    // Notify the change.
    this.dataChange.next(data);
  }

  /**
   * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
   * The return value is the list of `TodoItemNode`.
   */
  public _buildFileTree(arr: any[] = [], level: number = 0, parentId?: string, isFilter?: boolean, path?: string): CategoryNode[] {
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
        node.status = current.status;
        node.id = current.id;
        node.path = current.path;

        if (current.children && current.children.length) {
          node.hasChildren = true;
          node.children = this._buildFileTree(current.children, level + 1, current.id);
        }

        return accumulator.concat(node);
      }, []);
    }
  }

  private _addPathToCategories(categories: any[], path: number = 0): any[] {
    for (let i = 0; i < categories.length; i++) {
      const obj = categories[i];
      obj.path = `${path}.${categories[i].id}`;
      const children = obj && obj.children ? obj.children : [];
      if (children.length > 0) {
        this._addPathToCategories(children, obj.path);
      }
      if (!obj.children) {
        obj.second = true;
      }
    }

    return categories;
  }

  /** Add an item to to-do list */
  insertItem(parent: TodoItemNode, name: string) {
    if (parent.children) {
      parent.children.push({nameRu: name} as TodoItemNode);
      this.dataChange.next(this.data);
    }
  }

  updateItem(node: TodoItemNode, name: string) {
    node.nameRu = name;
    this.dataChange.next(this.data);
  }

  onFilterValueChanged(): void {
    this.formControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this._unsubscribe$)
      )
      .subscribe((value: string) => {
        if (!value || value === '') {
          this.dataSource.data = this._buildFileTree(this._categories);

          if (!this.treeControlFlatNodesCopy) {
            this.treeControlFlatNodesCopy = cloneDeep(this.treeControl.dataNodes);
          }
          this.initialize();
        } else {
          this.filterCategories(value);
        }
      });
  }

  filterCategories(value: string): void {
    if (!this.treeControlFlatNodesCopy) {
      this.treeControlFlatNodesCopy = cloneDeep(this.treeControl.dataNodes);
    }
    this.filteredTreeData = this.treeControlFlatNodesCopy.filter(node => {
      return node.nameRu.toUpperCase().indexOf(value.toUpperCase()) > -1;
    });

    this.filteredTreeData.forEach((node) => {
      const childNode = this.treeControlFlatNodesCopy.filter(child => {
        return child.path.indexOf(node.path) > -1;
      });
      if (childNode && childNode.length > 0) {
        childNode.forEach((a) => {
          if (!this.filteredTreeData.find(d => d.path === a.path)) {
            this.filteredTreeData.push(a);
          }
        });
      } 
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

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: TodoItemFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);
  }

  public sandListCategory () {
    const sendArr = [];
    let parentData = null;
    this.checklistSelection.selected.forEach((a, index) => {
      if (a.expandable === false) {
        const parrentId = a.path.split('.')[1];
        if (parentData !== parrentId) {
          parentData = parrentId;
          const findParent = this.category.find(item => item.categoryId === parentData);
          const parentCategory = {
            id: findParent ? findParent.id : null,
            categoryId: parentData,
            parent: null,
            priority: this.checklistSelection.selected.length
          };
          sendArr.push(parentCategory);
        }
        const category = {
          id: null,
          categoryId: a.id,
          parent: parrentId,
          priority: index
        };
        sendArr.push(category);
      }
    });
    const sendData = {
      marketplace: this.market.name,
      categories: sendArr
    };
    this.isLoading = false;
    this.marketService.postMarketplaceCategory(sendData).subscribe(next => {
      this.isLoading = false;
      this._matDialogRef.close();
    });
  }

  saveNode(node: TodoItemFlatNode, itemValue: string) {
    const nestedNode = this.flatNodeMap.get(node);
    // tslint:disable-next-line:no-non-null-assertion
    this.updateItem(nestedNode!, itemValue);
  }

  public closeDialog () { 
    this._matDialogRef.close();
  }

  public addCategory(item) {
    this.sendCategory.push(item);
    this.category = this.category.filter(some => some.id !== some.id);
  }
}
