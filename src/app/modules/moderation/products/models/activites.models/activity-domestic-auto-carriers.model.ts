export class ActivityDomesticAutoContacts {
  constructor(
    public email: string,
    public fullName: string,
    public phone: string,
    public position: string,
    public additionalInfo: string
  ) {}
}

export class ActivityDomesticAutoFactAddress {
  constructor(
    public city: string,
    public country: string,
    public region: string
  ) {}
}
export class ActivityDomesticAutositeUrls {
  constructor(
    public url: string
  ) {}
}



export class ActivityDomesticAutoTermsIncoterms {
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
export class ActivityDomesticAutoTotalAmount {
  constructor(
    public container: number,
    public routes: number,
    public transport: number
  ) {}
}
export class ActivityDomesticAutoYearOfFound {
  constructor(
    public date: string,
    public timezone: string,
    public timezone_type: number
  ) {}
}
export class  ActivityDomesticAutoPaymentMethod {
  constructor(
    public cashlessPaymentsVATIncluded: boolean,
    public cashlessPaymentsWithoutVAT: boolean,
    public cashlessPaymentsOnCard: boolean,
    public cashPayment: boolean
  ) {}
}
export class  ActivityDomesticAutoaboutCompany {
  constructor(
    public customsPost: string,
    public executionOnYourContract: boolean,
    public assistanceInCustomsClearance: boolean,
    public weAreCustomsCompany: boolean,
  ) {}
}
export class  ActivityDomesticAutoaboutTradingOpportunities {
  constructor(
    public numberOfVehicles: string,
    public numberOfContainers: string,
    public numberOfRoutes: string,
    public containersInProperty: string,
    public exportDeclaration: boolean,
    public registrationUnderContractOfCarrier: boolean,

  ) {}
}
export class  ActivityDomesticAutoaboutdocumentsDocuments {
  constructor(
    public certificates: ActivityDomesticAutoaboutdocumentsDocumentsCertificates,
    public awards: ActivityDomesticAutoaboutdocumentsDocumentsCertificates,
    public otherDocuments: ActivityDomesticAutoaboutdocumentsDocumentsCertificates,
    public licenses: ActivityDomesticAutoaboutdocumentsDocumentsCertificates

  ) {}
}
export class  ActivityDomesticAutoaboutdocumentsDocumentsCertificates {
  constructor(
    public value: boolean,
    public files: [string]
  ) {}
}



export class ActivityDomesticAutoModel {
  constructor(
    public companyId: number,
    public contacts: ActivityDomesticAutoContacts,
    public contactsInformation,
    public countEmployees: number,
    public countEmployeesEqual: boolean,
    public equalFactCompanyAddress: boolean,
    public executionCargoContact: boolean,
    public factAddress: ActivityDomesticAutoFactAddress,
    public fullName: string,
    public id: number,
    public name: string,
    public nameCompanyEqual: boolean,
    public officeArea: number,
    public officeAreaEqual: boolean,
    public paymentMethod: ActivityDomesticAutoPaymentMethod,
    public responsiblePersons,
    public siteUrlEqual: boolean,
    public siteUrls: [ActivityDomesticAutositeUrls],
    public termsIncoterms: ActivityDomesticAutoTermsIncoterms,
    public totalAmount: ActivityDomesticAutoTotalAmount,
    public yearOfFound: ActivityDomesticAutoYearOfFound,
    public yearOfFoundEqual: boolean,
    public aboutCompany: ActivityDomesticAutoaboutCompany,
    public logo: [string],
    public tradingOpportunities: [ActivityDomesticAutoaboutTradingOpportunities],
    public documents: ActivityDomesticAutoaboutdocumentsDocuments,
  ) {}
}
