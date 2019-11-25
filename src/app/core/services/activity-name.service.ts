import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, BehaviorSubject} from 'rxjs';
import {map} from 'rxjs/operators';
import {ActivityNameModel} from '@b2b/models';
import {ConfigService} from '@b2b/services/config.service';
import {activityNamesMap} from '@b2b/services/activity-names-map';

export const ACTIVITY_API = {
  1: 'suppliers',
  2: 'manufacturers',
  3: 'customs-without-license',
  4: 'customs-brokers',
  5: 'international-auto-carriers',
  6: 'domestic-auto-carriers',
  7: 'international-rail-carriers',
  8: 'domestic-rail-carriers',
  9: 'international-air-carriers',
  10: 'domestic-air-carriers',
  11: 'sea-carriers',
  12: 'river-carriers',
  13: 'warehouse-rent',
  14: 'warehouses',
};

@Injectable({
  providedIn: 'root'
})
export class ActivityNameService {
  activitiesList = new BehaviorSubject(null);

  constructor(
    private _http: HttpClient,
    private _config: ConfigService) {
  }

  /**
   * Retrieve available activity names
   */
  getActivityNames(): Observable<ActivityNameModel[]> {
    const url = `${this._config.apiUrl}/activity-name`;
    return this._http.get(url)
      .pipe(
        map((res: any) => {
          const items = res._embedded.activity_name;
          items.forEach(item => normalizeActivityName(item));
          items.sort((a: ActivityNameModel, b: ActivityNameModel) => a.id - b.id);
          this.activitiesList.next(items);
          return items;
        })
      );
  }

  /**
   *
   */
  deleteActivityName(activityName: number, id: number): Observable<any> {
    return this._http.delete(`${this._config.apiUrl}/${ACTIVITY_API[activityName]}/${id}`);
  }

  getActivityNameById(id: number) {
    return this._http.get(`${this._config.apiUrl}/activity-name/${id}`)
      .pipe(
        map((activityName: any) => {
          normalizeActivityName(activityName);
          return activityName;
        })
      );
  }
}

function normalizeActivityName(item): void {
  item.id = +item.id;
  if (activityNamesMap[item.embeddedName]) {
    item.icon = activityNamesMap[item.embeddedName].icon;
  }
}
