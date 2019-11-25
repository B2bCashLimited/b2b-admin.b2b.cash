import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { Subscription, of } from 'rxjs';
import { UsersService } from 'app/modules/users/users.service';
import { SelectionModel } from '@angular/cdk/collections';
import {ConfirmDeleteComponent} from '../confirm-delete/confirm-delete.component';
import { filter, switchMap } from 'rxjs/operators';
import { ActivityNameService } from '@b2b/services/activity-name.service';

@Component({
  selector: 'b2b-employees-dialog',
  templateUrl: './employees-dialog.component.html',
  styleUrls: ['./employees-dialog.component.scss']
})
export class EmployeesDialogComponent implements OnInit, OnDestroy {
  private _getEmployeesSub: Subscription;
  private _activitySub: Subscription;
  selection = new SelectionModel<any>(true, []);
  employees: any;
  activities: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<EmployeesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: number[],
    private _usersService: UsersService,
    private _matDialog: MatDialog,
    private _activityNameService: ActivityNameService,
  ) { }

  ngOnInit() {
    this._activitySub = this._activityNameService.activitiesList.subscribe(res => {
      this.activities = res;
    });
    this.getEmployees();
  }

  getEmployees() {
    if (this._getEmployeesSub && !this._getEmployeesSub.closed) {
      this._getEmployeesSub.unsubscribe();
    }
    this._getEmployeesSub = this._usersService.getEmployees(this.data)
      .subscribe((res: any[]) => {
        this.employees = res;
      });
  }

  ngOnDestroy() {
    if (this._getEmployeesSub && !this._getEmployeesSub.closed) {
      this._getEmployeesSub.unsubscribe();
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.employees.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.employees.forEach(row => this.selection.select(row));
  }

  onStatusChanged(status: boolean, user): void {
    const obj = {
      status,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      phone: user.phone,
    };
    this._usersService.updateUserStatus(user.id, obj).subscribe();
  }

  onDestroySelectedUsersClick(): void {
    this._matDialog.open(ConfirmDeleteComponent, {
      width: '500px',
      data: {},
      disableClose: true,
    }).afterClosed()
      .pipe(
        filter((res) => res && !!res),
        switchMap(() => {
          const ids = this.selection.selected.map(item => item._embedded.user.id);
          return this._usersService.deleteUsers(ids);
        }),
        switchMap(() => this._usersService.getEmployees(this.data))
      ).subscribe(res => {
        this.employees = res;
        this.selection = new SelectionModel<any>(true, []);
      });
  }

  getActivitiesByCompany(companyId, user) {
    const company = user._embedded.companies.find(value => value.id === companyId);
    const activities = [];
    this.activities.map(value => {
      if (company[value.embeddedName].length) {
        activities.push(value['nameRu']);
      }
    });
    if (activities.length) {
      user.activityList = [...activities];
    } else {
      user.activityList = ['Нет активити'];
    }
  }

}
