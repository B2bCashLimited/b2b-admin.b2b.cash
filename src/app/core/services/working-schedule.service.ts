import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {ConfigService} from '@b2b/services/config.service';
import {
  CreatedWorkingScheduleSummary,
  ModifiedCreatedWorkingScheduleSummary, TimeZone,
  WorkingScheduleSummary
} from '@b2b/components/working-schedule/working-schedule-summary';

@Injectable({
  providedIn: 'root'
})
export class WorkingScheduleService {

  private apiUrl = this._configService.apiUrl;

  /**
   * @Constructor
   */
  constructor(private _http: HttpClient,
              private _configService: ConfigService) {
  }

  /**
   * Creates new working schedule
   */
  createWorkingSchedule(body: WorkingScheduleSummary): Observable<ModifiedCreatedWorkingScheduleSummary> {
    const url = `${this.apiUrl}/working-schedules`;
    return this._http.post(url, body)
      .pipe(map((res: CreatedWorkingScheduleSummary) => {
        return {
          id: res.id,
          isStandard: res.isStandard,
          isRegular: res.isRegular,
          timeZone: {
            ...res._embedded.timeZone,
            workingDays: res._embedded.workingDays
          }
        };
      }));
  }

  /**
   * Deletes working schedule
   */
  deleteWorkingSchedule(id: string): Observable<any> {
    const url = `${this.apiUrl}/working-schedules/${id}`;
    return this._http.delete(url);
  }

  /**
   * Retrieves time zone list
   */
  getTimeZoneList(): Observable<TimeZone[]> {
    const url = `${this.apiUrl}/time-zone`;
    return this._http.get(url)
      .pipe(map((res: any) => res._embedded.time_zone));
  }

}
