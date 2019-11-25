import { ActivityNameModel, Country, Currency, Document, RequisiteTemplate } from '@b2b/models';

export interface Invoice {
  actAdditional: any;
  activityName: ActivityNameModel;
  company: any;
  country: Country;
  currency: Currency;
  customsBroker: any;
  customsWithoutLicense: any;
  dateCreated: {
    date: Date;
  };
  datePaid: any;
  dateProcessed: any;
  document: Document;
  domesticAirCarrier: any;
  domesticRailCarrier: any;
  domesticTrucker: any;
  hash: string;
  id: string;
  internationalAirCarrier: any;
  internationalRailCarrier: any;
  internationalTrucker: any;
  invoiceAdditional: any;
  isArtificialPerson: boolean;
  isPaid: boolean;
  manufacturer: any;
  number: string;
  price: string;
  requisites: RequisiteTemplate;
  riverCarrier: any;
  seaCarrier: any;
  status: number;
  supplier: any;
  warehouse: any;
  warehouseRent: any;
  _embedded: any;
  _links: any;
}
