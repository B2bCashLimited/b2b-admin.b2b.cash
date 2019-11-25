export class FactAddress {
  constructor(
    private city: string,
    private cityName: string,
    private region: string,
    private regionName: string,
    private country: string,
    private countryName: string,
    private geoObject: GeoObject

  ) {}
}
export class GeoObject {
  constructor(
    private address: string,
    private lat: string,
    private lng: string
  ) {}
}
export class PersonCharge {
  constructor(
    private name: string,
    private fullName: string,
    private email: string,
    private phone: string
  ) {}
}
export class BuildingClass {
  constructor(
    private A: boolean,
    private B: boolean,
    private C: boolean,
    private D: boolean

  ) {}
}
export class Logo {
  constructor(
    private name: string,
    private url: string

  ) {}
}
export class TypeBuilding {
  constructor(
    private adminBuilding: boolean,
    private businessCenter: boolean,
    private businesslikeCenter: boolean,
    private businesslikeQuarter: boolean,
    private businesslikeHome: boolean,
    private logisticsCenter: boolean,
    private logisticsComplex: boolean,
    private mansion: boolean,
    private manufactureBuilding: boolean,
    private manufactureFacility: boolean,
    private officeWarehouseComplex: boolean,
    private officeBuilding: boolean,
    private tradeSocialCenter: boolean,
    private oldFund: boolean,
    private other: boolean,
    private shoppingCenter: boolean,
    private tradingHouse: boolean,
    private specializedShoppingCenter: boolean,
    private detachedBuilding: boolean,
    private technopark: boolean

  ) {}
}
export class TermsTransaction {
  constructor(
    private warmWarehouse: boolean,
    private coldWarehouse: boolean,
    private refrigerationChambers: boolean,
    private archivalStorage: boolean,
    private alcoholicWarehouses: boolean,
    private pharmaceuticalWarehouses: boolean,
    private freezers: boolean,
    private containerPlatform: boolean,
    private openArea: boolean,
    private customsWarehouses: boolean,
    private vegetables: boolean,
    private hangar: boolean
  ) {}
}
export class Photos {
  constructor(
    private name: string,
    private url: string
  ) {}
}
export class WarehouseParameters {
  constructor(
    private totalwarehouseArea: string,
    private areaLeased: string
  ) {}
}
export class SiteUrls {
  constructor(
    private url: string
  ) {}
}
export class Floor {
  constructor(
    private floorStart: number,
    private floorAll: number
  ) {}
}
export class ColumnGrid {
  constructor(
    private columnGridStart: number,
    private columnGridEnd: number
  ) {}
}

export class Condition {
  constructor(
    private typicalRepair: boolean,
    private requiresRepair: boolean,
    private goodRepair: boolean
  ) {}
}
export class Lift {
  constructor(
    private countPassengerLift: number,
    private liftingCapacityPassengerLift: number,
    private countGoodsLift: number,
    private liftingCapacityGoodsLift: number
  ) {}
}
export class LocationGate {
  constructor(
    private onTheRamp: string,
    private countGates: number
  ) {}
}
export class Telpher {
  constructor(
    private count: number,
    private liftingCapacity: number
  ) {}
}
export class CraneEquipment {
  constructor(
    private overheadCrane: number,
    private liftingCapacityOverheadCrane: number,
    private craneBeam: number,
    private liftingCapacityCraneBeam: number,
    private railwayCrane: number,
    private liftingCapacityRailwayCrane: number,
    private gantryCrane: number,
    private liftingCapacityGantryCrane: number,
  ) {}
}
export class Parking {
  constructor(
    private inTerritory: boolean,
    private outTerritory: boolean,
    private parkingPrice: boolean,
    private price: boolean,
    private forCars: boolean,
    private forTruck: boolean,
    private countForTruck: boolean,
    private countForCars: boolean,
  ) {}
}
export class Infrastructure {
  constructor(
    private buffet: boolean,
    private hotel: boolean,
    private centralReception: boolean,
    private officeRooms: boolean,
    private canteen: boolean
  ) {}
}
export class TermRent {
  constructor(
    private typeTermRent: string,
    private minimumRentTerm: string,
    private typeTerm: string,
    private vacationRentals: string
  ) {}
}
export class PriceRent {
  constructor(
    private minimumRentalRate: string,
    private currency: string,
    private communalPayments: string,
    private operatingCosts: string,
  ) {}
}
export class PaymentMethod {
  constructor(
    private cashlessPayments: boolean,
    private cashlessPaymentsVATIncluded: boolean,
    private cashlessPaymentsWithoutVAT: boolean,
    private cashlessPaymentsOnCard: boolean,
    private cashPayment: boolean,
  ) {}
}
export class TypeOfServices {
  constructor(
    private typeServiceShow: boolean,
    private period: string,
    private unit: string,
    private price: string,
    private currency: string
  ) {}
}
export class Sertificates {
  constructor(
    private name: string,
    private url: string,
    private type: string
  ) {}
}
export class OtherDocuments {
  constructor(
    private name: string,
    private url: string
  ) {}
}
export class Licenses {
  constructor(
    private name: string,
    private url: string
  ) {}
}
export class LegalFormActivity {
  constructor(
    private sertificates: Sertificates,
    private otherDocuments: OtherDocuments,
    private licenses: Licenses
  ) {}
}

export class ActivityRentedWarehouseModel {
  constructor(
    private types: [string],
    private name: [string],
    private nameCompanyEqual: boolean,
    private fullName: string,
    private equalFactCompanyAddress: boolean,
    private isLegalAddressProvided: boolean,
    private factAddress: FactAddress,
    private personCharge: PersonCharge,
    private yearOfFound: number,
    private yearOfFoundEqual: boolean,
    private buildingClass: BuildingClass,
    private logo: Logo,
    private typeBuilding: TypeBuilding,
    private termsTransaction: TermsTransaction,
    private photos: [Photos],
    private warehouseParameters: WarehouseParameters,
    private specialTechniques: string,
    private siteUrlEqual: boolean,
    private siteUrls: [SiteUrls],
    private heightStorageAreas: string,
    private floor: Floor,
    private columnGrid: ColumnGrid,
    private floorMaterial: string,
    private condition: Condition,
    private lift: Lift,
    private locationGate: LocationGate,
    private telpher: Telpher,
    private craneEquipment: CraneEquipment,
    private countWetPoints: number,
    private electricPower: number,
    private parking: Parking,
    private descriptionWarehouse: string,
    private infrastructure: Infrastructure,
    private typeRent: [string],
    private termRent: TermRent,
    private priceRent: PriceRent,
    private paymentMethod: PaymentMethod,
    private typeOfServices: [TypeOfServices],
    private prepayment: number,
    private securityDeposit: number,
    private contactNumbers: string,
    private legalFormActivity: LegalFormActivity,
    private companyId: string,
    ) {}
}
