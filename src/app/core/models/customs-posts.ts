import {City, Country, Region} from '@b2b/models';

export interface CustomsPosts {
  _links: any;
  _embedded: {
    customs_port: CustomsPost[];
  };
  page_count: number;
  page_size: number;
  total_items: number;
  page: number;
}

export interface CustomsPost {
  _embedded: {
    city: City;
    region: Region;
    country: Country;
  };
  _links: any;
  city: string;
  cityCn: string;
  cityEn: string;
  cityRu: string;
  codeCustom: string;
  countryCn: string;
  countryEn: string;
  countryRu: string;
  descCn: string;
  descEn: string;
  descRu: string;
  existingTs: string;
  id: number;
  nameCn: string;
  nameEn: string;
  nameRu: string;
  otherData: {
    ata: string;
    city: string;
    region: string;
    country: string;
    custClear: string;
    latitude: string;
    longitude: string;
    structurForm: string;
  };
  railwayList: any[];
  requisites: {
    phone: string;
    address: string;
    coato: string;
    okato: string;
    postcode: string;
  };
  shortNameRu: string;
  werehouses: string;
}
