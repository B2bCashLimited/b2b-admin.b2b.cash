import {City, Country, Region} from '@b2b/models';

export interface RailwayStations {
  _embedded: {
    railway_station: RailwayStation[];
  };
}

export interface RailwayStation {
  _embedded: {
    city: City;
    country: Country;
    region: Region;
  };
  _links: any;
  area: string;
  city: null;
  codeEcp: number;
  contacts: {
    region: string;
    country: string;
  };
  detachRoad: string;
  id: number;
  latitude: string;
  longitude: string;
  nameCn: string;
  nameEn: string;
  nameRu: string;
  railRoad: string;
  statusPort: string;
}
