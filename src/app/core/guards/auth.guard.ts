import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {AuthService} from '@b2b/services/auth.service';
import {SocketService} from '@b2b/services/socket.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private _authService: AuthService,
    private _router: Router,
    private _socketService: SocketService) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> {
    return this._authService.isLoggedIn()
      .pipe(
        map((user: any) => {
          if (!user || !user.username) {
            const queryParams = {continue: state.url};
            this._router.navigate(['signin'], {queryParams});
            return false;
          }
          this._socketService.connectToSocket(user.id);
          return true;
        })
      );
  }
}
