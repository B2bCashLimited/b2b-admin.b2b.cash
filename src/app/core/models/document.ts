import { Country } from '@b2b/models';

export interface Document {
  country?: Country;
  dateCreated: {
    date: Date;
  };
  dateUpdated: {
    date: Date;
  };
  daySend: number;
  id: string;
  name: string;
  template: string;
  timeSend: {
    date: Date;
    timezone_type: number;
    timezone: string;
  };
  type: number;
  _embedded: {
    country: Country;
  };
}
