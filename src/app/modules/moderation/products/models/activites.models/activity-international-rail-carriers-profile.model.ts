export class ActivityInternationalRailContacts {
  constructor(
    public email: string,
    public fullName: string,
    public phone: string,
    public position: string,
    public additionalInfo: string
  ) {}
}

export class ActivityInternationalRailFactAddress {
  constructor(
    public city: string,
    public country: string,
    public region: string
  ) {}
}
export class ActivityInternationalRailsiteUrls {
  constructor(
    public url: string
  ) {}
}



export class ActivityInternationalRailTermsIncoterms {
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
export class ActivityInternationalRailTotalAmount {
  constructor(
    public container: number,
    public routes: number,
    public transport: number
  ) {}
}
export class ActivityInternationalRailYearOfFound {
  constructor(
    public date: string,
    public timezone: string,
    public timezone_type: number
  ) {}
}
export class  ActivityInternationalRailPaymentMethod {
  constructor(
    public cashlessPaymentsVATIncluded: boolean,
    public cashlessPaymentsWithoutVAT: boolean,
    public cashlessPaymentsOnCard: boolean,
    public cashPayment: boolean
  ) {}
}
export class  ActivityInternationalRailaboutCompany {
  constructor(
    public customsPost: string,
    public executionOnYourContract: boolean,
    public assistanceInCustomsClearance: boolean,
    public weAreCustomsCompany: boolean,
  ) {}
}
export class  ActivityInternationalRailaboutTradingOpportunities {
  constructor(
    public numberOfVehicles: string,
    public numberOfContainers: string,
    public numberOfRoutes: string,
    public containersInProperty: string,
    public exportDeclaration: boolean,
    public registrationUnderContractOfCarrier: boolean,

  ) {}
}
export class  ActivityInternationalRailaboutdocumentsDocuments {
  constructor(
    public certificates: ActivityInternationalRailaboutdocumentsDocumentsCertificates,
    public awards: ActivityInternationalRailaboutdocumentsDocumentsCertificates,
    public otherDocuments: ActivityInternationalRailaboutdocumentsDocumentsCertificates,
    public licenses: ActivityInternationalRailaboutdocumentsDocumentsCertificates

  ) {}
}
export class  ActivityInternationalRailaboutdocumentsDocumentsCertificates {
  constructor(
    public value: boolean,
    public files: [string]
  ) {}
}



export class ActivityInternationalRailModel {
  constructor(
    public companyId: number,
    public contacts: ActivityInternationalRailContacts,
    public contactsInformation,
    public countEmployees: number,
    public countEmployeesEqual: boolean,
    public equalFactCompanyAddress: boolean,
    public executionCargoContact: boolean,
    public factAddress: ActivityInternationalRailFactAddress,
    public fullName: string,
    public id: number,
    public name: string,
    public nameCompanyEqual: boolean,
    public officeArea: number,
    public officeAreaEqual: boolean,
    public paymentMethod: ActivityInternationalRailPaymentMethod,
    public responsiblePersons,
    public siteUrlEqual: boolean,
    public siteUrls: [ActivityInternationalRailsiteUrls],
    public termsIncoterms: ActivityInternationalRailTermsIncoterms,
    public totalAmount: ActivityInternationalRailTotalAmount,
    public yearOfFound: ActivityInternationalRailYearOfFound,
    public yearOfFoundEqual: boolean,
    public aboutCompany: ActivityInternationalRailaboutCompany,
    public logo: [string],
    public tradingOpportunities: [ActivityInternationalRailaboutTradingOpportunities],
    public documents: ActivityInternationalRailaboutdocumentsDocuments,
  ) {}
}
