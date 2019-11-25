
export class CompanySummary {
  id: string;
  name: string;
  nameRu?: string;
  nameEn?: string;
  nameCn?: string;
  shortName: string;
  shortNameRu?: string;
  shortNameEn?: string;
  shortNameCn?: string;
  yearOfFound: any;
  officeArea: number;
  numberEmployees: number;
  status: number;
  cashPayments: boolean;
  cashlessPaymentsVATIncluded: boolean;
  cashlessPaymentsWithoutVAT: boolean;
  cashlessPaymentsOnCard: boolean;
  rating: number;
  selected: boolean;
  deleted: boolean;
  dateDeleted?: string;
  warehouses: any[];
  warehousesRents: any[];
  seaCarriers: any[];
  riverCarriers: any[];
  manufacturers: any[];
  internationalTruckers: any[];
  internationalRailCarriers: any[];
  internationalAirCarriers: any[];
  domesticTruckers: any[];
  domesticRailCarriers: any[];
  domesticAirCarriers: any[];
  customsWithoutLicenses: any[];
  customsBrokers: any[];
  factAddress?: any;
  legalAddress?: any;
  country: any;
  siteUrls: any;
  companyDetails: any;
  companyDetailsRu: any;
  companyDetailsEn: any;
  companyDetailsCn: any;
  logo: any;
  suppliers: any[];
  ratingForm?: any;
  ratingTemplate?: any;
  ratingDetails?: any;
  quiz?: any[];
  correct?: string;
  reject?: string;
  _embedded?: any;
}