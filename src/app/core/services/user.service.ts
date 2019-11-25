import {Injectable} from '@angular/core';
import {ConfigService} from '@b2b/services/config.service';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {NgxPermissionsService} from 'ngx-permissions';
import {setToLocalStorage} from '@b2b/utils';
import {Permissions} from '@b2b/enums';

export const SUPER_ADMIN = 1;
export const EMPLOYEE = 2;

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private _currentUser: any;

  constructor(
    private _config: ConfigService,
    private _http: HttpClient,
    private _permissions: NgxPermissionsService) {
  }

  get currentUser(): any {
    return this._currentUser;
  }

  set currentUser(value: any) {
    if (this._currentUser !== value) {
      this._currentUser = value;
      if (this._currentUser) {
        setToLocalStorage('B2B_USER', this._currentUser.username);
      }
    }
  }

  getUser(email: string): Observable<any> {
    const obj = {
      'filter[0][type]': 'eq',
      'filter[0][field]': 'email',
      'filter[0][value]': email,
      'filter[1][type]': 'eq',
      'filter[1][field]': 'isDeleted',
      'filter[1][value]': '0'
    };

    const params = new HttpParams({fromObject: obj});

    return this._http.get(`${this._config.apiUrl}/users`, {params})
      .pipe(
        map((res: any) => res._embedded.user[0]),
        map((user: any) => {
          if (user && user.adminLevel >= SUPER_ADMIN) {
            user.id = +user.id;
            user.adminPosition = user.adminPosition || user._embedded.adminPosition;
            if (user.adminLevel === EMPLOYEE && user.adminPosition) {
              user.adminPosition.id = +user.adminPosition.id;
              const permissions = user.adminPosition.roleData || [];
              this._permissions.loadPermissions(permissions);
            } else if (user.adminLevel === SUPER_ADMIN) {
              this._permissions.loadPermissions([Permissions.SUPER_ADMIN]);
            }
            return this.currentUser = user;
          }
          return this.currentUser = null;
        })
      );
  }

}
