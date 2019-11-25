import {LinksSummary} from './links-summary';

export interface CountrySummary {
  id: number | string;
  important?: boolean;
  nameCn: string;
  nameEn: string;
  nameRu: string;
  count?: number;                   // custom, used on front (company moderation)
  _links?: LinksSummary;
}
