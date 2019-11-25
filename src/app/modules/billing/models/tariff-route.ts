export interface TariffRoute {
  readonly id?: number;
  isFixed: boolean;
  deliveryType: number | any;
  currency: number | any;
  priceExtra: number | null;
  coefficient: number | null;
  countryFrom: number | any;
  countryTo: number | any;
  regionFrom?: any;
  regionTo?: any;
  localityFrom?: any;
  localityTo?: any;
  loadingRiverport?: any;
  unloadingRiverport?: any;
  loadingSeaport?: any;
  unloadingSeaport?: any;
  loadingAirport?: any;
  unloadingAirport?: any;
  loadingStation?: any;
  unloadingStation?: any;
  _embedded?: any;
}
