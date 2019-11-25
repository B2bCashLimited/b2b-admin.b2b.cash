export class Geolocation {
  name: string;
  type?: string;
  id?: string;
  country?: Geolocation;
  active?: boolean;
  coords?: {
    lat: string,
    lng: string,
  };
}
