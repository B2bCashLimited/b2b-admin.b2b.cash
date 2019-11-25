export interface Airports {
  _embedded: { air_port: Airport[] };
}

export interface Airport {
  id: number;
  contacts: Contacts;
  latitude: string;
  longitude: string;
  gmtOffset: string;
  iataCode: string;
  icaoCode: string;
  isoCode: string;
  runwayLength: number;
  nameRu: string;
  nameEn: string;
  nameCn: string;
  city: null;
  _embedded: any;
  _links: any;
}

interface Contacts {
  fax: string;
  city: string;
  email: string;
  phone: string;
  country: string;
  website: string;
}

