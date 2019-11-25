import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient, HttpParams, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ConfigService} from '@b2b/services/config.service';

@Injectable()
export class HttpService {
  constructor(
    public _config: ConfigService,
    private router: Router,
    private http: HttpClient) {
  }

  get(url: string, params: any = {}): Observable<HttpResponse<any>> {
    return this.http.get<any>(this._config.apiUrl + url, this.addOptions(this.toHttpParams(params)));
  }

  post(url: string, body: any = {}): Observable<HttpResponse<any>> {
    return this.http.post<any>(this._config.apiUrl + url, body, this.addOptions());
  }

  put(url: string, body: any = {}): Observable<HttpResponse<any>> {
    return this.http.put<any>(this._config.apiUrl + url, body, this.addOptions());
  }

  patch(url: string, body: any = {}): Observable<HttpResponse<Object>> {
    return this.http.patch<any>(this._config.apiUrl + url, body, this.addOptions());
  }

  delete(url: string): Observable<HttpResponse<any>> {
    return this.http.delete<any>(this._config.apiUrl + url, this.addOptions());
  }

  private toHttpParams(params) {
    return Object.getOwnPropertyNames(params)
      .reduce((p, key) => p.set(key, params[key]), new HttpParams());
  }

  private addOptions(params?: HttpParams) {
    const options = {};
    if (params) {
      options['params'] = params;
    }
    return options;
  }
}
