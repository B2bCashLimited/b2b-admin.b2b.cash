export interface Message {
  activityId: number;
  activityKey: string;
  activityName: string;
  attributes?: any;
  chat_id: number;
  chat_relations_id: number;
  companyName: string;
  date_send: string;
  firstname: string;
  id: number;
  lastname: string;
  readby: number[];
  status: number;
  text: string;
  type: string;
  user_id: number;
}
