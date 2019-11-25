import {LinksSummary} from './links-summary';

export interface CategorySummary {
  id: number | string;
  nameRu: string;
  nameEn: string;
  nameCn: string;
  autoForm: boolean;
  dateCreated?: any;
  enabled: boolean;
  orderForm: CategoryOrderFormSummary;
  orderPreview: {
    id: string,
    enabled: boolean
  };
  pId: string;
  path: string;
  viewedByModerator: boolean;
  parent?: any;
  _links?: LinksSummary;
}

export interface CategoryPropertySummary {
  category: number | CategorySummary;
  controlUnitType?: number;
  descCn?: boolean;
  descEn?: boolean;
  descRu?: boolean;
  enabled: boolean;                                   // true - show to sort on admin SHOWCASE and add value on client SHOWCASE
  formula?: any | { value: string };
  id: number;
  ignoredValues: any[];
  isFormula: boolean;
  nameCn: string;
  nameEn: string;
  nameRu: string;
  orderEnabled: number;                               // true - show on make an ORDER on admin and client
  orderPriority: number;                              // ORDER priority on admin and client
  possibleValuesCn?: string;
  possibleValuesEn?: string;
  possibleValuesRu?: string;
  possibleValuesExt?: any;
  priority: number;                                   // characteristics priority to sort on admin SHOWCASE and add value on client SHOWCASE
  propertyFunction?: string;
  special: number;
  specialWorth: number;
  status: boolean;
  useArea: number;
  valueType: number;
  viewType: number;
  waitingOffers?: any;
  _embedded?: any;
  _links?: LinksSummary;
}

interface CategoryOrderFormSummary {
  enabled: boolean;
  id: string;
  minimalAmount?: number;
  minimalAmountManufacture?: number;
  minimalAmountSupplier?: number;
  status: number;
  totalCountFormula: any[];
}
