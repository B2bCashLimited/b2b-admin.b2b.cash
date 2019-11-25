export interface Сreate {
  toggle: number;
  name: string;
  activity: any;
  owner: {
    companyId: number,
    userId: number,
    activity: any
  };
  relations: Array<{
    name: string,
    companyId: number,
    userId: number,
    activity: string
    activityId: number
  }>;
  section: number;
  subactivity: number;
}
