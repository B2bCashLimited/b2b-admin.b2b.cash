import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {BehaviorSubject} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';
import {HttpClient, HttpParams} from '@angular/common/http';
import {ConfigService} from '@b2b/services/config.service';


@Injectable()
export class WindowsListService {

  usersChanged = new BehaviorSubject<any>(null);

  constructor(private _config: ConfigService,
              private _http: HttpClient) {
  }

  getData(url: string, obj: any = {}): Observable<any> {
    const params = new HttpParams({fromObject: obj});
    return this._http.get(`${this._config.apiUrl}/${url}`, {params});
  }

  getDataForSearch(url: string, obj: any = {}): Observable<any> {
    const params = new HttpParams({fromObject: obj});
    return this._http.get(`${this._config.apiUrl}/${url}`, {params});
  }

  addData(url: string, body): Observable<any> {
    return this._http.post(`${this._config.apiUrl}/${url}`, body);
  }

  editData(url: string, body): Observable<any> {
    return this._http.put(`${this._config.apiUrl}/${url}`, body);
  }

  updateModerateStatus(body): Observable<any> {
    return this._http.post(`${this._config.apiUrl}/update-products-moderate-status`, body);
  }

  deleteData(url: string, body): Observable<any> {
    return this._http.post(`${this._config.apiUrl}/${url}`, body);
  }

  get dataListAsync() {
    return this.usersChanged.asObservable().pipe(distinctUntilChanged());
  }

  setusersList(e) {
    this.usersChanged.next(e);
  }
}
