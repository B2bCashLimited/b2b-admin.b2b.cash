import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {UsersService} from '../../users.service';
import {ConfigService} from '@b2b/services/config.service';
import {MatDialog} from '@angular/material';
import {filter, map, switchMap} from 'rxjs/operators';
import {DeleteRoleDialogComponent} from '../dialogs/delete-role-dialog/delete-role-dialog.component';
import {ClearSubscriptions} from '@b2b/decorators';
import {Subscription} from 'rxjs';

@ClearSubscriptions()
@Component({
  selector: 'b2b-roles-index',
  templateUrl: './roles-index.component.html',
  styleUrls: ['./roles-index.component.scss']
})
export class RolesIndexComponent implements OnDestroy, OnInit {
  roles: any;

  private _sub: Subscription;

  constructor(
    private _formBuilder: FormBuilder,
    private _usersService: UsersService,
    private _config: ConfigService,
    private _matDialog: MatDialog) {
  }

  ngOnDestroy() {
    // @ClearSubscriptions()
  }

  ngOnInit() {
    this._sub = this._usersService.getAdminPositions()
      .subscribe((roles: any) => this.roles = roles);
  }

  onDestroyClick(roleId: number): void {
    this._matDialog.open(DeleteRoleDialogComponent, {
        width: '500px',
        disableClose: true,
        data: {
          roles: this.roles.filter(role => role.id !== roleId)
        }
      }
    ).afterClosed()
      .pipe(
        filter((res) => res && !!res),
        switchMap((res) => {
          const body = {deleteAdminPosition: roleId, newAdminPosition: res};
          return this._usersService.removeAdminPosition(body);
        }),
      )
      .subscribe(() => {
        this.roles = this.roles.filter(role => role.id !== roleId);
      });
  }
}
