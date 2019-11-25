import {City, Country, Region} from '@b2b/models';

export interface SeaPorts {
  _embedded: {
    sea_port: SeaPort[];
  };
}

export interface SeaPort {
  _embedded: {
    city: City;
    country: Country;
    region: Region;
  };
  _links: any;
  contacts: {
    address: string;
    country: string;
  };
  daylightSavingTime: boolean;
  id: number;
  latitude: string;
  latitudeDegrees: number;
  latitudeIndicator: string;
  latitudeMinutes: number;
  longitude: string;
  longitudeDegrees: number;
  longitudeIndicator: string;
  longitudeMinutes: string;
  nameCn: string;
  nameEn: string;
  nameRu: string;
  statusPort: string;
  unlocode: string;
}
