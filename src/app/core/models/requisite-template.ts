import {City, Country, Region} from '@b2b/models';

export interface RequisiteTemplate {
  name: string;
  country: Country;
  companyName: string;
  companyRegion: Region;
  companyCity: City;
  companyAddress: string;
  ogrn: string;
  egryul: string;
  id: number;
  inn: string;
  kpp: string;
  oktmo: string;
  okved: string;
  businessLicense: string;
  identityCard: string;
  bankName: string;
  bankAddress: string;
  bankAccountNumber: string;
  bankSwift: string;
  bankInn: string;
  bankKpp: string;
  correspondentAccountNumber: string;
  bik: string;
  intermediaryBankName: string;
  intermediaryBankAddress: string;
  intermediaryBankAccountNumber: string;
  intermediaryBankSwift: string;
  isAct: boolean;
  isInvoice: boolean;
  imgStamp: string;
  imgSign: string;
  type: number;
  _embedded: {
    country: Country,
    companyRegion: Region,
    companyCity: City
  };
}
