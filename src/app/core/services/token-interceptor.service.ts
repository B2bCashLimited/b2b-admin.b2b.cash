import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {tap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';
import {ConfigService} from '@b2b/services/config.service';
import {AuthToken} from '@b2b/models';
import {clearLocalStorage, getFromLocalStorage} from '@b2b/utils';

@Injectable({
  providedIn: 'root'
})
export class TokenInterceptorService implements HttpInterceptor {

  constructor(private _config: ConfigService,
              private _router: Router) {
  }

  /**
   * Intercept an outgoing http request and optionally transform it or the response.
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const auth: AuthToken = getFromLocalStorage('B2B_TOKEN');
    if (req.url.indexOf(this._config.apiUrl) !== -1) {
      if (auth && auth.access_token) {
        req = req.clone({
          setHeaders: {
            Authorization: `${auth.token_type} ${auth.access_token}`
          }
        });
      }
      return this.handleRequest(req, next);
    }
    return next.handle(req);
  }

  /**
   * Handle each request for api and set Authorization header if logged in
   */
  private handleRequest(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req)
      .pipe(
        tap((evt: HttpEvent<any>) => {
            if (evt instanceof HttpResponse) {
              // TODO something with response if needed
            }
            return evt;
          },
          (err: any) => {
            if (err instanceof HttpErrorResponse) {
              if (err.status === 401 || err.status === 403) {
                clearLocalStorage();
                this._router.navigate(['signin']);
              }
            }
          })
      );
  }
}
