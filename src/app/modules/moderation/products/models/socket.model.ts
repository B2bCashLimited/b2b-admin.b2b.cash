
export interface ProductSocketModel {
    id: number;
    categoryId: number;
    categoryNameCn: string;
    categoryNameEn: string;
    categoryNameRu: string;
    date_moderate: string;
}

export interface CategorySocketModel {
    id: number;
    name: string;
    moderateMinTime: string;
    productCount: number;
    productsId: number[];
}
