export interface Countries {
  _embedded: {
    country: Country[];
  };
}

export interface Country {
  id: number;
  important: boolean;
  nameCn: string;
  nameEn: string;
  nameRu: string;
  _links: any[];
}
