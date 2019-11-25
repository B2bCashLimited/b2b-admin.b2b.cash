import {City, Country, Region} from '@b2b/models';

export interface RequisiteTemplateData {
  name: string;
  country: number;
  companyName: string;
  companyRegion: number;
  companyCity: number;
  companyAddress: string;
  ogrn: string;
  egryul: string;
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
  imgStamp: string;
  imgSign: string;
  status: number;
  type: number;
  countryData?: Country;
  regionData?: Region;
  cityData?: City;
  _embedded?: {
    country: Country,
    companyRegion: Region,
    companyCity: City
  };
}
