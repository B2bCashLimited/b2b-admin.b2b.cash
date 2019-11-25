import {Consultant} from './consultant';

export interface ConsultantList {
  consultants: Consultant[];
  negative: number;
  positive: number;
  responseTime: number;
  timeout: number;
  total: number;
  totalResponseTime: number;
  workTime: number;
}
