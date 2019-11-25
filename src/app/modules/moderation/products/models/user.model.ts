
export class User {
  id: number;
  firstName: string;
  lastName: string;
  middleName: string;
  phone: string;
  email: string;
  password: string;
  username: string;
  dateCreate?: DateInfo;
  auth?: string;
  client?: string;
  auth_time?: DateInfo;
  photos?: Array<Object>;
}


export class AdminUser {
  id: number;
  firstName: string;
  lastName: string;
  middleName: string;
  phone: string;
  email: string;
  type: string;
  password: string;
  username: string;
  client?: string;
  dateCreate?: DateInfo;
  auth?: string;
  is_admin: boolean;
  auth_time?: DateInfo;
  photos?: Array<Object>;
}

export interface DateInfo {
  date: string;
  timezone_type: number;
  timezone: string;
}
