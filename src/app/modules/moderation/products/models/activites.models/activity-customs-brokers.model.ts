export class ActivityCustomsBrokersContacts {
  constructor(
    public email: string,
    public fullName: string,
    public phone: string,
    public position: string,
    public additionalInfo: string
  ) {}
}

export class ActivityCustomsBrokersFactAddress {
  constructor(
    public city: string,
    public country: string,
    public region: string
  ) {}
}
export class ActivityCustomsBrokerssiteUrls {
  constructor(
    public url: string
  ) {}
}



export class ActivityCustomsBrokersTermsIncoterms {
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
export class ActivityCustomsBrokersTotalAmount {
  constructor(
    public container: number,
    public routes: number,
    public transport: number
  ) {}
}
export class ActivityCustomsBrokersYearOfFound {
  constructor(
    public date: string,
    public timezone: string,
    public timezone_type: number
  ) {}
}
export class  ActivityCustomsBrokersPaymentMethod {
  constructor(
    public cashlessPaymentsVATIncluded: boolean,
    public cashlessPaymentsWithoutVAT: boolean,
    public cashlessPaymentsOnCard: boolean,
    public cashPayment: boolean
  ) {}
}
export class  ActivityCustomsBrokersaboutCompany {
  constructor(
    public customsPost: string,
    public executionOnYourContract: boolean,
    public assistanceInCustomsClearance: boolean,
    public weAreCustomsCompany: boolean,
  ) {}
}
export class  ActivityCustomsBrokersaboutTradingOpportunities {
  constructor(
    public numberOfVehicles: string,
    public numberOfContainers: string,
    public numberOfRoutes: string,
    public containersInProperty: string,
    public exportDeclaration: boolean,
    public registrationUnderContractOfCarrier: boolean,

  ) {}
}
export class  ActivityCustomsBrokersaboutdocumentsDocuments {
  constructor(
    public certificates: ActivityCustomsBrokersaboutdocumentsDocumentsCertificates,
    public awards: ActivityCustomsBrokersaboutdocumentsDocumentsCertificates,
    public otherDocuments: ActivityCustomsBrokersaboutdocumentsDocumentsCertificates,
    public licenses: ActivityCustomsBrokersaboutdocumentsDocumentsCertificates

  ) {}
}
export class  ActivityCustomsBrokersaboutdocumentsDocumentsCertificates {
  constructor(
    public value: boolean,
    public files: [string]
  ) {}
}



export class ActivityCustomsBrokersModel {
  constructor(
    public companyId: number,
    public contacts: ActivityCustomsBrokersContacts,
    public contactsInformation,
    public countEmployees: number,
    public countEmployeesEqual: boolean,
    public equalFactCompanyAddress: boolean,
    public executionCargoContact: boolean,
    public factAddress: ActivityCustomsBrokersFactAddress,
    public fullName: string,
    public id: number,
    public name: string,
    public nameCompanyEqual: boolean,
    public officeArea: number,
    public officeAreaEqual: boolean,
    public paymentMethod: ActivityCustomsBrokersPaymentMethod,
    public responsiblePersons,
    public siteUrlEqual: boolean,
    public siteUrls: [ActivityCustomsBrokerssiteUrls],
    public termsIncoterms: ActivityCustomsBrokersTermsIncoterms,
    public totalAmount: ActivityCustomsBrokersTotalAmount,
    public yearOfFound: ActivityCustomsBrokersYearOfFound,
    public yearOfFoundEqual: boolean,
    public aboutCompany: ActivityCustomsBrokersaboutCompany,
    public logo: [string],
    public tradingOpportunities: [ActivityCustomsBrokersaboutTradingOpportunities],
    public documents: ActivityCustomsBrokersaboutdocumentsDocuments,
  ) {}
}
