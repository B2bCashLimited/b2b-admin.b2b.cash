export class ActivityManufacturesContacts {
  constructor(
    public email: string,
    public fullName: string,
    public phone: string,
    public position: string,
    public additionalInfo: string
  ) {}
}

export class ActivityManufacturesFactAddress {
  constructor(
    public city: string,
    public country: string,
    public region: string
  ) {}
}
export class ActivityManufacturessiteUrls {
  constructor(
    public url: string
  ) {}
}



export class ActivityManufacturesTermsIncoterms {
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
export class ActivityManufacturesTotalAmount {
  constructor(
    public container: number,
    public routes: number,
    public transport: number
  ) {}
}
export class ActivityManufacturesYearOfFound {
  constructor(
    public date: string,
    public timezone: string,
    public timezone_type: number
  ) {}
}
export class  ActivityManufacturesPaymentMethod {
  constructor(
    public cashlessPaymentsVATIncluded: boolean,
    public cashlessPaymentsWithoutVAT: boolean,
    public cashlessPaymentsOnCard: boolean,
    public cashPayment: boolean
  ) {}
}
export class  ActivityManufacturesaboutCompany {
  constructor(
    public customsPost: string,
    public executionOnYourContract: boolean,
    public assistanceInCustomsClearance: boolean,
    public weAreCustomsCompany: boolean,
  ) {}
}
export class  ActivityManufacturesaboutTradingOpportunities {
  constructor(
    public numberOfVehicles: string,
    public numberOfContainers: string,
    public numberOfRoutes: string,
    public containersInProperty: string,
    public exportDeclaration: boolean,
    public registrationUnderContractOfCarrier: boolean,

  ) {}
}
export class  ActivityManufacturesaboutdocumentsDocuments {
  constructor(
    public certificates: ActivityManufacturesaboutdocumentsDocumentsCertificates,
    public awards: ActivityManufacturesaboutdocumentsDocumentsCertificates,
    public otherDocuments: ActivityManufacturesaboutdocumentsDocumentsCertificates,
    public licenses: ActivityManufacturesaboutdocumentsDocumentsCertificates

  ) {}
}
export class  ActivityManufacturesaboutdocumentsDocumentsCertificates {
  constructor(
    public value: boolean,
    public files: [string]
  ) {}
}



export class ActivityManufacturesModel {
  constructor(
    public companyId: number,
    public contacts: ActivityManufacturesContacts,
    public contactsInformation,
    public countEmployees: number,
    public countEmployeesEqual: boolean,
    public equalFactCompanyAddress: boolean,
    public executionCargoContact: boolean,
    public factAddress: ActivityManufacturesFactAddress,
    public fullName: string,
    public id: number,
    public name: string,
    public nameCompanyEqual: boolean,
    public officeArea: number,
    public officeAreaEqual: boolean,
    public paymentMethod: ActivityManufacturesPaymentMethod,
    public responsiblePersons,
    public siteUrlEqual: boolean,
    public siteUrls: [ActivityManufacturessiteUrls],
    public termsIncoterms: ActivityManufacturesTermsIncoterms,
    public totalAmount: ActivityManufacturesTotalAmount,
    public yearOfFound: ActivityManufacturesYearOfFound,
    public yearOfFoundEqual: boolean,
    public aboutCompany: ActivityManufacturesaboutCompany,
    public logo: [string],
    public tradingOpportunities: [ActivityManufacturesaboutTradingOpportunities],
    public documents: ActivityManufacturesaboutdocumentsDocuments,
  ) {}
}
