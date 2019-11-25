export class ActivityInternationalAirContacts {
  constructor(
    public email: string,
    public fullName: string,
    public phone: string,
    public position: string,
    public additionalInfo: string
  ) {}
}

export class ActivityInternationalAirFactAddress {
  constructor(
    public city: string,
    public country: string,
    public region: string
  ) {}
}
export class ActivityInternationalAirsiteUrls {
  constructor(
    public url: string
  ) {}
}



export class ActivityInternationalAirTermsIncoterms {
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
export class ActivityInternationalAirTotalAmount {
  constructor(
    public container: number,
    public routes: number,
    public transport: number
  ) {}
}
export class ActivityInternationalAirYearOfFound {
  constructor(
    public date: string,
    public timezone: string,
    public timezone_type: number
  ) {}
}
export class  ActivityInternationalAirPaymentMethod {
  constructor(
    public cashlessPaymentsVATIncluded: boolean,
    public cashlessPaymentsWithoutVAT: boolean,
    public cashlessPaymentsOnCard: boolean,
    public cashPayment: boolean
  ) {}
}
export class  ActivityInternationalAiraboutCompany {
  constructor(
    public customsPost: string,
    public executionOnYourContract: boolean,
    public assistanceInCustomsClearance: boolean,
    public weAreCustomsCompany: boolean,
  ) {}
}
export class  ActivityInternationalAiraboutTradingOpportunities {
  constructor(
    public numberOfVehicles: string,
    public numberOfContainers: string,
    public numberOfRoutes: string,
    public containersInProperty: string,
    public exportDeclaration: boolean,
    public registrationUnderContractOfCarrier: boolean,

  ) {}
}
export class  ActivityInternationalAiraboutdocumentsDocuments {
  constructor(
    public certificates: ActivityInternationalAiraboutdocumentsDocumentsCertificates,
    public awards: ActivityInternationalAiraboutdocumentsDocumentsCertificates,
    public otherDocuments: ActivityInternationalAiraboutdocumentsDocumentsCertificates,
    public licenses: ActivityInternationalAiraboutdocumentsDocumentsCertificates

  ) {}
}
export class  ActivityInternationalAiraboutdocumentsDocumentsCertificates {
  constructor(
    public value: boolean,
    public files: [string]
  ) {}
}



export class ActivityInternationalAirModel {
  constructor(
    public companyId: number,
    public contacts: ActivityInternationalAirContacts,
    public contactsInformation,
    public countEmployees: number,
    public countEmployeesEqual: boolean,
    public equalFactCompanyAddress: boolean,
    public executionCargoContact: boolean,
    public factAddress: ActivityInternationalAirFactAddress,
    public fullName: string,
    public id: number,
    public name: string,
    public nameCompanyEqual: boolean,
    public officeArea: number,
    public officeAreaEqual: boolean,
    public paymentMethod: ActivityInternationalAirPaymentMethod,
    public responsiblePersons,
    public siteUrlEqual: boolean,
    public siteUrls: [ActivityInternationalAirsiteUrls],
    public termsIncoterms: ActivityInternationalAirTermsIncoterms,
    public totalAmount: ActivityInternationalAirTotalAmount,
    public yearOfFound: ActivityInternationalAirYearOfFound,
    public yearOfFoundEqual: boolean,
    public aboutCompany: ActivityInternationalAiraboutCompany,
    public logo: [string],
    public tradingOpportunities: [ActivityInternationalAiraboutTradingOpportunities],
    public documents: ActivityInternationalAiraboutdocumentsDocuments,
  ) {}
}
