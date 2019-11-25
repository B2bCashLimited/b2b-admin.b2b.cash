import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfigService } from '@b2b/services/config.service';
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, OnInit, Inject } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { CategoryService } from '@b2b/services/category.service';
import { TreeItemFlatNode, TreeItemNode } from './tree.model';

@Component({
  selector: 'b2b-tree',
  templateUrl: 'tree.component.html',
  styleUrls: ['tree.component.scss']
})
export class TreeComponent implements OnInit {
  isMultiple = false;
  isLoading = false;
  searchValue;
  flatNodeMap = new Map<TreeItemFlatNode, TreeItemNode>();
  nestedNodeMap = new Map<TreeItemNode, TreeItemFlatNode>();
  selectedParent: TreeItemFlatNode | null = null;
  treeControl: FlatTreeControl<TreeItemFlatNode>;
  treeFlattener: MatTreeFlattener<TreeItemNode, TreeItemFlatNode>;
  dataSource: MatTreeFlatDataSource<TreeItemNode, TreeItemFlatNode>;
  checklistSelection = new SelectionModel<TreeItemFlatNode>(true);

  selectedCategory: any;

  private _categories: any[] = [];
  private _categoriesCopy: string;
  getLevel = (node: TreeItemFlatNode) => node.level;
  isExpandable = (node: TreeItemFlatNode) => node.expandable;
  getChildren = (node: TreeItemNode): TreeItemNode[] => node.children;
  hasChild = (_: number, _nodeData: TreeItemFlatNode) => _nodeData.expandable;

  constructor(
    public config: ConfigService,
    @Inject(MAT_DIALOG_DATA) private _dialogData: any,
    private _matDialogRef: MatDialogRef<TreeComponent>,
    private _categoryService: CategoryService) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<TreeItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  }

  ngOnInit() {
    this.isMultiple = this._dialogData && this._dialogData.multiple;
    this.isLoading = true;
    this._categoryService.getCategoriesTree().subscribe((res: any) => {
      this.isLoading = false;
      this._categories = res;
      this._categoriesCopy = JSON.stringify(res);
      this.dataSource.data = res;
    });
  }

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: TreeItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.nameRu === node.nameRu
      ? existingNode
      : new TreeItemFlatNode();
    flatNode.nameRu = node.nameRu;
    flatNode.nameCn = node.nameCn;
    flatNode.nameEn = node.nameEn;
    flatNode.level = level;
    flatNode.status = node.status;
    flatNode.id = node.id;
    flatNode.level = level;
    flatNode.path = node.path;
    flatNode.expandable = !!node.children;
    flatNode.parentId = node.parentId || null;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  /** Whether all the descendants of the node are selected. */
  descendantsAllSelected(node: TreeItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    return descAllSelected;
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: TreeItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: TreeItemFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    // Force update for the parent
    descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    this.checkAllParentsSelection(node);
  }

  /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
  todoLeafItemSelectionToggle(node: TreeItemFlatNode): void {
    this.checklistSelection.toggle(node);
    this.checkAllParentsSelection(node);
  }

  /* Checks all the parents when a leaf node is selected/unselected */
  checkAllParentsSelection(node: TreeItemFlatNode): void {
    let parent: TreeItemFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  /** Check root node checked state and change it accordingly */
  checkRootNodeSelection(node: TreeItemFlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }
  }

  /* Get the parent node of a node */
  getParentNode(node: TreeItemFlatNode): TreeItemFlatNode | null {
    const currentLevel = this.getLevel(node);
    if (currentLevel < 1) {
      return null;
    }
    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];
      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  search() {
    if (this.searchValue) {
      this.dataSource.data = this._filterTreeData(JSON.parse(this._categoriesCopy), this.searchValue);
      this.treeControl.expandAll();
    } else {
      this.dataSource.data = this._categories;
      this.treeControl.collapseAll();
    }
  }

  private _filterTreeData(arr: any[], value: string): any[] {
    return arr.filter((item) => {
      if (!item.children) {
        return (<string>item.nameRu.toLowerCase()).includes(value.toLowerCase());
      }
      item.children = this._filterTreeData(item.children, value);
      return !!(item.children && item.children.length);
    });
  }

  onConfirm() {
    if (this.isMultiple) {
      const selectedCats = this.checklistSelection.selected.filter((item) => !item.expandable);
      this._matDialogRef.close(selectedCats);
    } else {
      this._matDialogRef.close(this.selectedCategory);
    }
  }
}
