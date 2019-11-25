import {Region} from '@b2b/models';

export interface Cities {
  _links: any;
  _embedded: {
    locality: City[];
  };
  page_count: number;
  page_size: number;
  total_items: number;
  page: number;
}

export interface City {
  _links: any;
  area: string;
  id: number;
  nameCn: string;
  nameEn: string;
  nameRu: string;
  region: Region;
  fullAddress?: string;
}
