export class ActivityRiverContacts {
  constructor(
    public email: string,
    public fullName: string,
    public phone: string,
    public position: string,
    public additionalInfo: string
  ) {}
}

export class ActivityRiverFactAddress {
  constructor(
    public city: string,
    public country: string,
    public region: string
  ) {}
}
export class ActivityRiversiteUrls {
  constructor(
    public url: string
  ) {}
}



export class ActivityRiverTermsIncoterms {
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
export class ActivityRiverTotalAmount {
  constructor(
    public container: number,
    public routes: number,
    public transport: number
  ) {}
}
export class ActivityRiverYearOfFound {
  constructor(
    public date: string,
    public timezone: string,
    public timezone_type: number
  ) {}
}
export class  ActivityRiverPaymentMethod {
  constructor(
    public cashlessPaymentsVATIncluded: boolean,
    public cashlessPaymentsWithoutVAT: boolean,
    public cashlessPaymentsOnCard: boolean,
    public cashPayment: boolean
  ) {}
}
export class  ActivityRiveraboutCompany {
  constructor(
    public customsPost: string,
    public executionOnYourContract: boolean,
    public assistanceInCustomsClearance: boolean,
    public weAreCustomsCompany: boolean,
  ) {}
}
export class  ActivityRiveraboutTradingOpportunities {
  constructor(
    public numberOfVehicles: string,
    public numberOfContainers: string,
    public numberOfRoutes: string,
    public containersInProperty: string,
    public exportDeclaration: boolean,
    public registrationUnderContractOfCarrier: boolean,

  ) {}
}
export class  ActivityRiveraboutdocumentsDocuments {
  constructor(
    public certificates: ActivityRiveraboutdocumentsDocumentsCertificates,
    public awards: ActivityRiveraboutdocumentsDocumentsCertificates,
    public otherDocuments: ActivityRiveraboutdocumentsDocumentsCertificates,
    public licenses: ActivityRiveraboutdocumentsDocumentsCertificates

  ) {}
}
export class  ActivityRiveraboutdocumentsDocumentsCertificates {
  constructor(
    public value: boolean,
    public files: [string]
  ) {}
}



export class ActivityRiverModel {
  constructor(
    public companyId: number,
    public contacts: ActivityRiverContacts,
    public contactsInformation,
    public countEmployees: number,
    public countEmployeesEqual: boolean,
    public equalFactCompanyAddress: boolean,
    public executionCargoContact: boolean,
    public factAddress: ActivityRiverFactAddress,
    public fullName: string,
    public id: number,
    public name: string,
    public nameCompanyEqual: boolean,
    public officeArea: number,
    public officeAreaEqual: boolean,
    public paymentMethod: ActivityRiverPaymentMethod,
    public responsiblePersons,
    public siteUrlEqual: boolean,
    public siteUrls: [ActivityRiversiteUrls],
    public termsIncoterms: ActivityRiverTermsIncoterms,
    public totalAmount: ActivityRiverTotalAmount,
    public yearOfFound: ActivityRiverYearOfFound,
    public yearOfFoundEqual: boolean,
    public aboutCompany: ActivityRiveraboutCompany,
    public logo: [string],
    public tradingOpportunities: [ActivityRiveraboutTradingOpportunities],
    public documents: ActivityRiveraboutdocumentsDocuments,
  ) {}
}
