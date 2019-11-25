export interface WorkingScheduleSummary {
  id?: string;
  isStandard: number;
  isRegular: number;
  adminPosition: string;
  timeZone: number;
  workingDays: WorkingDay[];
  _embedded?: any;
}

export interface CreatedWorkingScheduleSummary {
  id: string;
  isStandard: number;
  isRegular: number;
  _embedded: {
    timeZone: TimeZone,
    workingDays: WorkingDay[]
  };
}

export interface ModifiedCreatedWorkingScheduleSummary {
  id: string;
  isStandard: number;
  isRegular: number;
  timeZone: ModifiedTimeZone;
}

export interface WorkingDay {
  dayOfWeek: number;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  date: string;
  isHoliday: boolean;
}

export interface TimeZone {
  id: number;
  country: any;
  nameCn: string;
  nameEn: string;
  nameRu: string;
  utcOffset: string;
  winterTime: boolean;
}

interface ModifiedTimeZone extends TimeZone {
  workingDays: WorkingDay[];
}
