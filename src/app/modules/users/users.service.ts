import {Injectable} from '@angular/core';
import {ConfigService} from '@b2b/services/config.service';
import {HttpClient, HttpParams} from '@angular/common/http';
import {map, switchMap} from 'rxjs/operators';
import {removeEmptyProperties} from '@b2b/utils';
import {Observable, of} from 'rxjs';
import {SocketService} from '@b2b/services/socket.service';
import {omit} from 'lodash';

@Injectable()
export class UsersService {

  constructor(
    private _config: ConfigService,
    private _http: HttpClient,
    private _socketService: SocketService) {
  }

  changeAdminPosition(body: any): Observable<any> {
    return this._http.post(`${this._config.apiUrl}/change-admin-position`, body);
  }

  getAdminListUsers(query: any, page = 1, limit = 10) {
    const obj: any = {...query, page, limit};
    const params = new HttpParams({fromObject: removeEmptyProperties(obj)});

    return this._http.get(`${this._config.apiUrl}/get-admin-list-users`, {params})
      .pipe(
        map((res: any) => {
          const users = res._embedded['get-admin-list-users'];
          users.forEach(user => {
            user.id = +user.id;
            user.adminPosition = user._embedded.adminPosition || {};
            if (user.adminPosition.hasOwnProperty('id')) {
              user.adminPosition.id = +user.adminPosition.id;
            }
            user.companies = user._embedded.companies || [];
            if (user.companies && user.companies.length > 0) {
              user.companies.forEach(company => {
                company.id = +company.id;
              });
            }
            user.country = user._embedded.country || {};
            if (user.country.hasOwnProperty('id')) {
              user.country.id = +user.country.id;
            }
          });
          return {
            page: res.page,
            pageCount: res.page_count,
            pageSize: res.page_size,
            totalItems: res.total_items,
            users,
          };
        })
      );
  }

  addUser(body: any) {
    return this._http.post(`${this._config.apiUrl}/users`, body);
  }

  registerUser(body: any) {
    return this._http.post(`${this._config.apiUrl}/user-register`, omit(body, ['adminLevel', 'adminPosition']))
      .pipe(
        map((res: { user: any }) => res.user),
        switchMap((user: any) => this._changeUserLevel(body, user))
      );
  }

  updateUser(id: number, body: any) {
    return this._http.put(`${this._config.apiUrl}/users/${id}`, omit(body, ['adminLevel', 'adminPosition']))
      .pipe(
        switchMap((user: any) => this._changeUserLevel(body, user))
      );
  }

  updateUserStatus(id: number, body: any) {
    return this._http.put(`${this._config.apiUrl}/users/${id}`, body)
      .pipe(
        map((res: any) => {
          const data = {user_id: id, status: res.status};
          this._socketService.emit('user_status_update', data);
          return res;
        })
      );
  }

  deleteUsers(ids: number[]) {
    return this._http.post(`${this._config.apiUrl}/remove-users`, {users: ids});
  }

  getAdminPositions() {
    return this._http.get(`${this._config.apiUrl}/admin-position`)
      .pipe(
        map((res: any) => {
          const roles = res._embedded.admin_position;
          roles.forEach(role => role.id = +role.id);
          return roles;
        })
      );
  }

  getAdminPositionById(id: number) {
    return this._http.get(`${this._config.apiUrl}/admin-position/${id}`)
      .pipe(
        map((adminPosition: any) => {
          adminPosition.id = +adminPosition.id;
          return adminPosition;
        })
      );
  }

  createAdminPosition(body: any) {
    return this._http.post(`${this._config.apiUrl}/admin-position`, body);
  }

  updateAdminPosition(id: number, body: any) {
    return this._http.put(`${this._config.apiUrl}/admin-position/${id}`, body);
  }

  removeAdminPosition(body: { deleteAdminPosition: number, newAdminPosition: number }) {
    return this._http.post(`${this._config.apiUrl}/remove-admin-position-change-users`, body);
  }

  getEmployees(companyIds: number[]): Observable<any> {
    const url = `${this._config.apiUrl}/employee`;
    const params = {
      'filter[0][type]': 'in',
      'filter[0][field]': 'company'
    };
    if (companyIds.length) {
      let i = 0;
      companyIds.map(value => {
        params[`filter[0][values][${i}]`] = value;
        i++;
      });
    }
    return this._http.get(url, {params}).pipe(map((res: any) => {
      return res._embedded.employee;
    }));
  }

  private _changeUserLevel(body: any, user: any) {
    return this._http.post(`${this._config.apiUrl}/change-admin-level`, {userId: user.id, adminLevel: body.adminLevel})
      .pipe(
        switchMap(() => {
          if (body.adminLevel === 2) {
            return this.changeAdminPosition({userId: user.id, adminPosition: body.adminPosition});
          }
          return of(user);
        })
      );
  }
}
