import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {AuthService} from '@b2b/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SigninGuard implements CanActivate {

  constructor(
    private _authService: AuthService,
    private _router: Router) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> {
    return this._authService.isLoggedIn()
      .pipe(
        map((user: any) => {
          if (user && user.username) {
            this._router.navigate(['']);
            return false;
          }
          return true;
        })
      );
  }
}
