export class FullAddress {

  country: string;
  countryName?: string;

  region: string;
  regionName?: string;

  city: string;
  cityName?: string;

  geoObject: {
    address: string,
    placeId?: string,
    lat: number,
    lng: number
  };

  // geoObject: {
  //   formatted_address: string,
  //   geometry: {
  //     placeId?: string,
  //     location: {
  //       lat: number,
  //       lng: number
  //     }
  //   }
  // }
}
