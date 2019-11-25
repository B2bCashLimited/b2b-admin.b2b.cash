export class ActivityInternationalAutoTermsIncoterms {
  constructor(
    public CIP: boolean,
    public CPT: boolean,
    public DAP: boolean,
    public DAT: boolean,
    public DDP: boolean,
    public EXW: boolean,
    public FCA: boolean,
  ) {}
}

export class  AreaLand {
  constructor(
    public warehouse: number,
    public officeCompany: number
  ) {}
}
export class  DateEstablishment {
  constructor(
    public date: string,
    public timezone_type: number,
    public timezone: string
  ) {}
}
export class  TotalYearSales {
  constructor(
    public value: number,
    public сurrency: number
  ) {}
}
export class  TermsDelivery {
  constructor(
    public doNotShip: boolean,
    public deliver: boolean,
    public atHisOwnExpense: boolean,
  ) {}
}
export class  MainSupplyMarkets {
  constructor(
    public country: number,
    public percent: string
  ) {}
}
export class  NearestPortsDelivery {
  constructor(
    public name: string,
    public geodata: string
  ) {}
}
export class  FactoriesDeliveries {
  constructor(
    public name: string,
    public country: number,
    public city: string,
  ) {}
}
export class  NonFactoryProduction {
  constructor(
    public country: number,
    public city: string,
  ) {}
}
export class  NearestRailwayStationDelivery {
  constructor(
    public name: string,
    public geodata: string,
  ) {}
}
export class  ExportTurnover {
  constructor(
    public country: number,
    public percent: string,
  ) {}
}
export class  AddressWarehouseShipment {
  constructor(
    public country: number,
    public city: string,
  ) {}
}
export class  PaymentMethod {
  constructor(
    public cashlessPayments: boolean,
    public cash: boolean,
  ) {}
}
export class  Documents {
  constructor(
    public typeDocument: [string]
  ) {}
}
export class  SiteUrl {
  constructor(
    public url: string
  ) {}
}

export class ActivitySuppliersModel {
  constructor(
    public products: string,
    public termsIncoterms: ActivityInternationalAutoTermsIncoterms,
    public exclusiveProductRight: boolean,
    public trademark: boolean,
    public areaLand: AreaLand,
    public dateEstablishment: DateEstablishment,
    public totalYearSales: TotalYearSales,
    public termsDelivery: TermsDelivery,
    public mainSupplyMarkets: MainSupplyMarkets,
    public nearestPortsDelivery: NearestPortsDelivery[],
    public factoriesDeliveries: FactoriesDeliveries,
    public nonFactoryProduction: NonFactoryProduction,
    public deliveryCredit: boolean,
    public nearestRailwayStationDelivery: NearestRailwayStationDelivery[],
    public exportTurnover: ExportTurnover,
    public addressWarehouseShipment: AddressWarehouseShipment,
    public siteUrls: null,
    public name: string,
    public shortName: string,
    public logo: null,
    public description: string,
    public photos: [string],
    public yearOfFound: null,
    public numberEmployees: string,
    public officeArea: string,
    public addInformation: string,
    public legalForm: string,
    public paymentMethod: PaymentMethod,
    public requisites: null,
    public documents: Documents,
    public siteUrl: SiteUrl[],
    public id: string,


  ) {}
}
