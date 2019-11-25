import {Photo} from '../models/photo.model';

export interface ActivityModel {
  id: number;
  name: string;
  description: string;
  rating: number;
  type: 'manufacturer' | 'supplier';
  contacts: Contact[];
  logo: Photo[];
  moderateStatus: number;
}

interface Contact {
  phone: string;
  email: string;
}
