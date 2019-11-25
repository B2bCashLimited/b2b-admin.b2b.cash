import {DateInfo} from './mime-types';

export interface Contact {
  dateCreated: any;
  activityDate: DateInfo;
  activityId: number[];
  activityKey: string[];
  activityName: string[];
  avatars: {
    link: string;   // '/data/images/30aa2382c04e7430b332db371fe86161HYI_Logo_3D.jpg'
    name: string;   // 'HYI_Logo_3D.jpg'
    numberInput: number;
    type: string;   // 'image/jpeg'
  }[][];
  chatNames: string[];
  closed: boolean;
  closedBy: {
    inWork?: boolean;
    absense?: boolean;
    posRate?: boolean;
    negRate?: boolean;
    ban?: boolean;
  };
  countUnread: number;
  country: {
    id: string;
    nameCn: string;
    nameEn: string;
    nameRu: string;
  };
  id: string;
  lastMessage: string;
  logo: any;
  name: string;
  owner: {
    email: string;
    firstName: string;
    id: string;
    lastName: string;
    middleName: string;
    phone: string;
    username: string;
  };
  _links: any;
}
