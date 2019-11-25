export class TreeItemNode {
  id: number;
  status: number;
  nameRu: string;
  nameCn: string;
  nameEn: string;
  path: string;
  parentId?: number;
  children?: TreeItemNode[];
}
export class TreeItemFlatNode {
  expandable: boolean;
  id: number;
  status: number;
  nameRu: string;
  nameCn: string;
  nameEn: string;
  path: string;
  level: number;
  parentId?: number;
}
