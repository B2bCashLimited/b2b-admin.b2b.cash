export interface Consultant {
  activity: string[];
  country: string[];
  email: string;
  firstName: string;
  id: string;
  language: string[];
  lastName: string;
  middleName: string;
  phone: string;
  photos: any[];
  roles: string[];
  stat: {
    positive: number;
    negative: number;
    responseTime: number;
    total: number;
    timeout: number;
    workTime: number;
  };
  username: string;
}
