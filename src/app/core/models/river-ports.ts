import {City, Country, Region} from '@b2b/models';

export interface RiverPorts {
  _embedded: {
    river_port: RiverPort[];
  };
}

export interface RiverPort {
  _embedded: {
    city: City;
    country: Country;
    region: Region;
  };
  _links: any;
  contacts: {
    services: {
      bulk_cargo: boolean;
      container: boolean;
      direct_mixed_message: boolean;
      passenger: boolean;
      piece_cargo: boolean;
    }
  };
  id: number;
  international: boolean;
  latitude: string;
  longitude: string;
  nameCn: string;
  nameEn: string;
  nameRu: string;
}
