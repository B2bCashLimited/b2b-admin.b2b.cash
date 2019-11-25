import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { keys, pickBy, omit, cloneDeep, values as lodashValues } from 'lodash';
import { RoleType } from '../role-type';
import { ROLES_LIST, ROLES_LIST_VALUES } from '../roles-list';
import { UsersService } from '../../users.service';
import { ActivatedRoute, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LanguagesDialogComponent } from '../dialogs/languages-dialog/languages-dialog.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'b2b-roles-edit',
  templateUrl: './roles-edit.component.html',
  styleUrls: ['./roles-edit.component.scss']
})
export class RolesEditComponent implements OnInit {
  ROLES_LIST_VALUES = ROLES_LIST_VALUES;
  adminRoles;
  clientRoles;
  salesRoles;
  formGroup: FormGroup;
  permissions: any[];
  isNewRole = false;
  workingSchedule: any;
  id = 0;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _usersService: UsersService,
    private _matDialog: MatDialog) {
  }

  ngOnInit() {
    let adminPosition = this._route.snapshot.data.role || {};
    this.workingSchedule = adminPosition.workingSchedule;
    this.id = adminPosition.id;
    this.isNewRole = this._route.snapshot.data.isNewRole;
    if (this.isNewRole) {
      adminPosition = omit(adminPosition, ['nameRu', 'nameEn', 'nameCn']);
    }
    this.adminRoles = getRolesByType(RoleType.Admin);
    this.clientRoles = getRolesByType(RoleType.Client);
    this.salesRoles = getRolesByType(RoleType.Sales);
    this.permissions = adminPosition.roleData || [];
    const groups = {};
    ROLES_LIST.forEach(item => {
      const children = {};
      item.roles.forEach(role => {
        children[role] = new FormControl(this.permissions.includes(role));
      });
      groups[item.key] = this._formBuilder.group(children);
    });
    this.formGroup = this._formBuilder.group({
      activity: [adminPosition.activity],
      language: [adminPosition.language],
      nameRu: [adminPosition.nameRu, [Validators.required]],
      nameEn: [adminPosition.nameEn, [Validators.required]],
      nameCn: [adminPosition.nameCn, [Validators.required]],
      ...groups,
    });

    this.formGroup.get('groups').valueChanges
      .subscribe((value) => {
        keys(value).forEach(key => {
          const obj = this.formGroup.value;
          keys(obj[key]).forEach(item => {
            this.formGroup.get(`${key}.${item}`).patchValue(value[key]);
          });
        });
      });

    this.formGroup.get('users.USERS_CREATE').valueChanges
      .subscribe((value) => {
        if (value) {
          this.formGroup.get('users.USERS_VIEW').patchValue(true);
          this.formGroup.get('users.USERS_VIEW').disable();
        } else if (lodashValues(this.formGroup.get('users').value).filter((bool) => bool).length < 2) {
          this.formGroup.get('users.USERS_VIEW').enable();
        }
      });
    this.formGroup.get('users.USERS_EDIT').valueChanges
      .subscribe((value) => {
        if (value) {
          this.formGroup.get('users.USERS_VIEW').patchValue(true);
          this.formGroup.get('users.USERS_VIEW').disable();
        } else if (lodashValues(this.formGroup.get('users').value).filter((bool) => bool).length < 2) {
          this.formGroup.get('users.USERS_VIEW').enable();
        }
      });
    this.formGroup.get('users.USERS_DELETE').valueChanges
      .subscribe((value) => {
        if (value) {
          this.formGroup.get('users.USERS_VIEW').patchValue(true);
          this.formGroup.get('users.USERS_VIEW').disable();
        } else if (lodashValues(this.formGroup.get('users').value).filter((bool) => bool).length < 2) {
          this.formGroup.get('users.USERS_VIEW').enable();
        }
      });
  }

  onDoneClick(): void {
    const roleData = [];
    const { nameRu, nameEn, nameCn, language, activity, country } = this.formGroup.value;
    const obj = omit(this.formGroup.value, ['nameRu', 'nameEn', 'nameCn', 'activity', 'language', 'country']);
    keys(obj).forEach(prop => {
      roleData.push(...keys(pickBy(obj[prop])));
    });

    if (roleData.includes('MODERATE_RATING_VIEW')) {
      roleData.push('MODERATE_RATING_STARS', 'MODERATE_RATING_EDIT', 'MODERATE_RATING_DELETE');
    }
    const body = { nameRu, nameEn, nameCn, language, activity, roleData, country };
    if (this.isNewRole) {
      this._usersService.createAdminPosition(body)
        .subscribe(() => {
          this._router.navigateByUrl('users/roles');
        });
    } else {
      const { roleId } = this._route.snapshot.params;
      this._usersService.updateAdminPosition(roleId, body)
        .subscribe(() => {
          this._router.navigateByUrl('users/roles');
        });
    }
  }

  onLanguagesClick(role: string): void {
    const { language, activity } = this.formGroup.value;
    this._matDialog.open(LanguagesDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {
        isBuyer: role === 'CHAT_CONSULTANT_BUYERS',
        language,
        activity,
        workingSchedule: this.workingSchedule,
        adminPositionId: this.id,
      }
    }
    ).afterClosed()
      .pipe(
        filter((res) => res && !!res),
      ).subscribe((res) => {
        this.formGroup.patchValue(res);
      });
  }
}

function getRolesByType(type: string) {
  return cloneDeep(ROLES_LIST.filter(role => role.type === type));
}

