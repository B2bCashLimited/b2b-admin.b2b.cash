import {ApplicationRef, Component, OnInit, ViewChild} from '@angular/core';
import {MatSidenav} from '@angular/material';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {AuthService} from '@b2b/services/auth.service';
import {Router} from '@angular/router';
import {clearLocalStorage} from '@b2b/utils';
import {MENU_ITEMS} from './menu-items';
import {NgxPermissionsService} from 'ngx-permissions';

@Component({
  selector: 'b2b-admin-index',
  templateUrl: './admin-index.component.html',
  styleUrls: ['./admin-index.component.scss']
})
export class AdminIndexComponent implements OnInit {
  @ViewChild('drawer') drawer: MatSidenav;

  menuItems = MENU_ITEMS;
  isHandset = false;

  constructor(
    private _breakpoint: BreakpointObserver,
    private _applicationRef: ApplicationRef,
    private _authService: AuthService,
    private _permissions: NgxPermissionsService,
    private _router: Router) {
  }


  ngOnInit(): void {
    this._breakpoint.observe([Breakpoints.Handset, Breakpoints.Small])
      .subscribe((result: BreakpointState) => this.isHandset = result.matches);
  }

  closeDrawer(): void {
    if ((this.isHandset) && this.drawer) {
      this.drawer.close();
    }
  }

  onSingOutClick(): void {
    clearLocalStorage();
    this._permissions.flushPermissions();
    this._router.navigate(['signin']);
    // this._authService.signout().subscribe();
  }

}
