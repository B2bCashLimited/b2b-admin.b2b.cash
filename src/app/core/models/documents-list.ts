import { ActivityNameModel, Country, Document } from '@b2b/models';

export interface DocumentsList {
  activityName: ActivityNameModel;
  company: any;
  country: Country;
  dateCreated: {
    date: Date;
  };
  datePaid: any;
  dateProcessed: any;
  document: Document;
  id: string;
  isArtificialPerson: boolean;
  isPaid: boolean;
  number: string;
  price: string;
  _links: any;
}
