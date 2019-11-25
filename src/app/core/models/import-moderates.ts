export interface ImportModerates {
  additionalParams: {
    id: number;
    name: string;
    nameRu: string;
    nameEn: string;
    nameCn: string;
    yandex_id: number;
    productPreview?: {
      name: string,
      description: string,
      image: string,
      model: string,
    }
  };
  dateCreated: {
    date: string;
  };
  id: number;
  status: number;
  taskId: number;
  categoryId: number;
  type: number;
  value: string;
}
