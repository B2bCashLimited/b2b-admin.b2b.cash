import {ApplicationRef, Component, HostListener, OnInit} from '@angular/core';
import {NgxPermissionsService} from 'ngx-permissions';
import {ConfigService} from '@b2b/services/config.service';
import {MatSnackBar} from '@angular/material';

@Component({
  selector: 'b2b-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private _timeStamp = 0;

  constructor(
    private _applicationRef: ApplicationRef,
    private _permissions: NgxPermissionsService,
    private _config: ConfigService,
    private _snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    this._showSnackBar();
  }

  /**
   * Logout before closing browser tab
   */
  @HostListener('window:beforeunload', ['$event'])
  OnBeforeUnload(): boolean {
    this._permissions.flushPermissions();
    this._applicationRef.components
      .forEach(component => component.destroy());
    return true;
  }

  @HostListener('document:touchstart', ['$event'])
  preventDoubleTapZoom(evt: any): void {
    const now = Date.now();
    if (evt && this._timeStamp + 500 > now) {
      evt.preventDefault();
    }
    this._timeStamp = now;
  }
  
  private _showSnackBar(): void {
    this._config.showSnackBar$
      .subscribe((evt: { message: string, action?: string, duration?: number }) => {
        this._snackBar.open(evt.message, evt.action || 'OK', {duration: evt.duration || 3000});
      });
  }
}
