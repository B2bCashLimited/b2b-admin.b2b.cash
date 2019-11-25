export class ActivityInternationalAutoContacts {
  constructor(
    public email: string,
    public fullName: string,
    public phone: string,
    public position: string,
    public additionalInfo: string
  ) {}
}

export class ActivityInternationalAutoFactAddress {
  constructor(
    public city: string,
    public country: string,
    public region: string
  ) {}
}
export class ActivityInternationalAutositeUrls {
  constructor(
    public url: string
  ) {}
}



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
export class ActivityInternationalAutoTotalAmount {
  constructor(
    public container: number,
    public routes: number,
    public transport: number
  ) {}
}
export class ActivityInternationalAutoYearOfFound {
  constructor(
    public date: string,
    public timezone: string,
    public timezone_type: number
  ) {}
}
export class  ActivityInternationalAutoPaymentMethod {
  constructor(
    public cashlessPaymentsVATIncluded: boolean,
    public cashlessPaymentsWithoutVAT: boolean,
    public cashlessPaymentsOnCard: boolean,
    public cashPayment: boolean
  ) {}
}
export class  ActivityInternationalAutoaboutCompany {
  constructor(
    public customsPost: string,
    public executionOnYourContract: boolean,
    public assistanceInCustomsClearance: boolean,
    public weAreCustomsCompany: boolean,
  ) {}
}
export class  ActivityInternationalAutoaboutTradingOpportunities {
  constructor(
    public numberOfVehicles: string,
    public numberOfContainers: string,
    public numberOfRoutes: string,
    public containersInProperty: string,
    public exportDeclaration: boolean,
    public registrationUnderContractOfCarrier: boolean,

  ) {}
}
export class  ActivityInternationalAutoaboutdocumentsDocuments {
  constructor(
    public certificates: ActivityInternationalAutoaboutdocumentsDocumentsCertificates,
    public awards: ActivityInternationalAutoaboutdocumentsDocumentsCertificates,
    public otherDocuments: ActivityInternationalAutoaboutdocumentsDocumentsCertificates,
    public licenses: ActivityInternationalAutoaboutdocumentsDocumentsCertificates

  ) {}
}
export class  ActivityInternationalAutoaboutdocumentsDocumentsCertificates {
  constructor(
    public value: boolean,
    public files: [string]
  ) {}
}



export class ActivityInternationalAutoModel {
    constructor(
        public companyId: number,
        public contacts: ActivityInternationalAutoContacts,
        public contactsInformation,
        public countEmployees: number,
        public countEmployeesEqual: boolean,
        public equalFactCompanyAddress: boolean,
        public executionCargoContact: boolean,
        public factAddress: ActivityInternationalAutoFactAddress,
        public fullName: string,
        public id: number,
        public name: string,
        public nameCompanyEqual: boolean,
        public officeArea: number,
        public officeAreaEqual: boolean,
        public paymentMethod: ActivityInternationalAutoPaymentMethod,
        public responsiblePersons,
        public siteUrlEqual: boolean,
        public siteUrls: [ActivityInternationalAutositeUrls],
        public termsIncoterms: ActivityInternationalAutoTermsIncoterms,
        public totalAmount: ActivityInternationalAutoTotalAmount,
        public yearOfFound: ActivityInternationalAutoYearOfFound,
        public yearOfFoundEqual: boolean,
        public aboutCompany: ActivityInternationalAutoaboutCompany,
        public logo: [string],
        public tradingOpportunities: [ActivityInternationalAutoaboutTradingOpportunities],
        public documents: ActivityInternationalAutoaboutdocumentsDocuments,
    ) {}
}
