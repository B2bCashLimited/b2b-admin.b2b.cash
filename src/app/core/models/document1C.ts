import { ActivityNameModel } from '@b2b/models';

export interface Document1C {
  activityName: ActivityNameModel;
  company: any;
  companyName: string;
  customsBroker: any;
  customsWithoutLicense: any;
  dateImported: {
    date: Date;
  };
  datePaid: {
    date: Date;
  };
  domesticAirCarrier: any;
  domesticRailCarrier: any;
  domesticTrucker: any;
  id: string;
  inn: string;
  internationalAirCarrier: any;
  internationalRailCarrier: any;
  internationalTrucker: any;
  kpp: string;
  manufacturer: any;
  price: number;
  riverCarrier: any;
  seaCarrier: any;
  supplier: any;
  warehouse: any;
  warehouseRent: any;
  _embedded: any;
  _links: any;
}
