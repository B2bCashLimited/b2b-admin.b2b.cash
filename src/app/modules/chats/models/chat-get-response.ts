import {Contact} from './contact';

export interface ChatGetResponse {
  page: number;
  page_count: number;
  page_size: number;
  total_items: number;
  _embedded: {
    chat: Contact[]
  };
  _links: any;
}
