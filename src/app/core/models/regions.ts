import {Country} from '@b2b/models';

export interface Regions {
  _links: any;
  _embedded: {
    region: Region[];
  };
  page_count: number;
  page_size: number;
  total_items: number;
  page: number;
}

export interface Region {
  country: Country;
  exeption?: any;
  id: number;
  nameCn: string;
  nameEn: string;
  nameRu: string;
  _links: any;
}
