import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpParams,
  HttpRequest,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { API_NAMES } from '@b2b/services/api-names';
import { ConfigService } from '@b2b/services/config.service';

@Injectable({
  providedIn: 'root'
})
export class CacheInterceptorService implements HttpInterceptor {

  constructor(
    private _config: ConfigService,
    private _router: Router,
    private _http: HttpClient) {
  }

  /**
   * Intercept an outgoing http request and optionally transform it or the response.
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.indexOf(this._config.apiUrl) !== -1 && !(/[get|delete]+-dictionary-cache/).test(req.url)) {
      return this.handleRequest(req, next);
    }
    return next.handle(req);
  }

  /**
   * Handle each request for api and set Authorization header if logged in
   */
  private handleRequest(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const params = req.params;
    const keys = params.keys();
    if (keys && keys.length > 0) {
      const obj = params.keys()
        .filter((key) => !(/undefined|null/).test(params.get(key)))
        .filter((key) => (`${params.get(key)}`).length > 0)
        .reduce((prev, key) => {
          prev[key] = params.get(key);
          return prev;
        }, {});
      req = req.clone({
        params: new HttpParams({fromObject: obj})
      });
    }

    req = this.callApiThroughCache(req);

    return next.handle(req)
      .pipe(
        switchMap((evt: HttpEvent<any>) => {
          const apiName = req.url.split(/.+\/api\/v\d\//ig).pop();
          if (apiName) {
            const api = apiName.split('/')[0];
            const apiVersion = req.url.match(/\/api\/v\d\//ig)[0];
            if (API_NAMES.includes(api) && (/post|put|delete/i).test(req.method)) {
              const url = `${this._config.apiUrl}/delete-dictionary-cache`;
              const httpParams = new HttpParams({fromObject: {url: `${apiVersion}${api}`}});
              return this._http.get(url, {params: httpParams})
                .pipe(map(() => evt));
            }
          }
          return of(evt);
        })
      );
  }

  /**
   * Replace request url to cache data
   */
  private callApiThroughCache(req: HttpRequest<any>): HttpRequest<any> {
    const match = req.urlWithParams.match(/(\/api\/v\d\/)(.+)/);
    if (match) {
      const [apiUrl, apiVersion, apiName] = match;
      const api = (apiName || '').split('?').shift().split('/')[0];
      if (API_NAMES.includes(api) && (/get/i).test(req.method)) {
        const url = `${this._config.apiUrl}/get-dictionary-cache`;
        const params = new HttpParams({fromObject: {url: `${apiUrl}`}});
        const httpRequest = new HttpRequest(<any>req.method, url, {params});
        req = Object.assign(req, httpRequest);
      }
    }
    return req;
  }
}
