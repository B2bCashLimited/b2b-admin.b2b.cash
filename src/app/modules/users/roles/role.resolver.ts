import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {UsersService} from '../users.service';
import {Observable} from 'rxjs';

@Injectable()
export class RoleResolver implements Resolve<any> {

  constructor(
    private _usersService: UsersService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return this._usersService.getAdminPositionById(route.params.roleId);
  }
}
