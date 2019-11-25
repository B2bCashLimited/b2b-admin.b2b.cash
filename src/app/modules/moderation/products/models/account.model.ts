import { Company } from './company.model';

export class Account {
  constructor(public companies: Company[]) { }
}
