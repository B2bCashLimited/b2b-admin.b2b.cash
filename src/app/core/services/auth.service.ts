import {Injectable} from '@angular/core';
import {ConfigService} from '@b2b/services/config.service';
import {HttpClient} from '@angular/common/http';
import {Observable, of as observableOf, throwError} from 'rxjs';
import {catchError, switchMap, tap} from 'rxjs/operators';
import {UserService} from '@b2b/services/user.service';
import {AuthToken} from '@b2b/models';
import {clearLocalStorage, getFromLocalStorage, setToLocalStorage} from '@b2b/utils';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private _config: ConfigService,
    private _http: HttpClient,
    private _userService: UserService) {
  }

  signin(username: string, password: string): Observable<any> {
    const body = {
      username,
      password,
      grant_type: 'password',
      client_id: 'front'
    };

    return this._http.post(this._config.oauthUrl, body)
      .pipe(
        catchError((err) => throwError(err)),
        tap((res) => setToLocalStorage('B2B_TOKEN', res)),
        switchMap(() => this._userService.getUser(username))
      );
  }

  signout(): Observable<any> {
    const auth: AuthToken = getFromLocalStorage('B2B_TOKEN');
    const body = {
      token: auth && auth.access_token,
      token_type_hint: 'access_token'
    };
    return this._http.post(`${this._config.oauthUrl}/revoke`, body);
  }

  isLoggedIn(): Observable<any> {
    const username = getFromLocalStorage('B2B_USER');
    const auth: AuthToken = getFromLocalStorage('B2B_TOKEN');
    if (username && auth && auth.access_token) {
      return this._userService.getUser(username)
        .pipe(
          catchError(() => {
            clearLocalStorage();
            return observableOf(null);
          })
        );
    }
    clearLocalStorage();
    return observableOf(null);
  }

}
