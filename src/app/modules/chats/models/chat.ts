import {Relations} from './relations';

export interface Chat {
  chatType: number;
  closed: any;
  dateCreated: any;
  deleted: boolean;
  id: number;
  lastMessage: string;
  logo: any;
  name: string;
  relations: Relations[];
  _embedded: {
    ownerCompany: any;
  };
  _links: any;
}
