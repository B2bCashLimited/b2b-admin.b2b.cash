import { Component, OnInit } from '@angular/core';
import { MatTableDataSource, MatDialog, PageEvent } from '@angular/material';
import { UsersTableElement } from '../platform/platform.component';
import { SelectionModel } from '@angular/cdk/collections';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { UsersService } from '../users.service';
import { ConfigService } from '@b2b/services/config.service';
import { ActivityNameService } from '@b2b/services/activity-name.service';
import { startWith, distinctUntilChanged, debounceTime, switchMap, filter, map } from 'rxjs/operators';
import * as moment from 'moment';

import { ConfirmDeleteComponent } from './dialogs/confirm-delete/confirm-delete.component';
import { AddUserDialogComponent } from './dialogs/add-user-dialog/add-user-dialog.component';

@Component({
  selector: 'b2b-phys-person',
  templateUrl: './phys-person.component.html',
  styleUrls: ['./phys-person.component.scss']
})
export class PhysPersonComponent implements OnInit {
  pageCount = 0;
  pageSize = 0;
  length = 0;
  displayedColumns: string[] = ['select', 'name', 'contacts', 'dateTime', 'status'];
  dataSource = new MatTableDataSource<UsersTableElement>();
  selection = new SelectionModel<UsersTableElement>(true, []);
  users: any[];
  formGroup: FormGroup;

  private _currentPage: number;
  private _usersSub: Subscription;
  private _activityNames = [];
  loading: boolean;

  constructor(
    private _formBuilder: FormBuilder,
    private _usersService: UsersService,
    private _config: ConfigService,
    private _activityNameService: ActivityNameService,
    private _matDialog: MatDialog) {
  }

  ngOnInit() {
    this.formGroup = this._formBuilder.group({
      searchName: null,
      searchCompany: null,
      activityKey: null,
      country: null,
      dateCreateFrom: null,
      dateCreateTo: null,
    });
    // this.dataSource.sort = this.sort;
    this._activityNameService.getActivityNames()
      .subscribe((activityNames: any) => this._activityNames = activityNames);

    this.selection.changed
      .subscribe();
    this.formGroup.valueChanges
      .pipe(
        startWith(this.formGroup.value),
        distinctUntilChanged(),
        debounceTime(300),
        switchMap(() => this._getAdminListUsers(1))
      )
      .subscribe(() => { this.loading = false; }, () => { this.loading = false; });
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  getPage(pageEvent: PageEvent): void {
    const pageIndex = pageEvent.pageIndex + 1;
    this._currentPage = pageIndex <= this.pageCount ? Math.min(pageIndex, this.pageCount) : 1;
    if (this._usersSub && !this._usersSub.closed) {
      this._usersSub.unsubscribe();
    }
    this._usersSub = this._getAdminListUsers(this._currentPage)
      .subscribe(() => { this.loading = false; }, () => { this.loading = false; });
  }

  onStatusChanged(status: boolean, user: UsersTableElement): void {
    const obj = {
      status,
      email: user.contacts.email,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      phone: user.contacts.phone,
    };
    this._usersService.updateUserStatus(user.id, obj).subscribe();
  }

  onAddNewUserClick(): void {
    this._matDialog.open(AddUserDialogComponent, {
      width: '500px',
      disableClose: true,
    }).afterClosed()
      .pipe(
        filter((res) => res && !!res),
        switchMap((res) => this._usersService.addUser(res)),
        switchMap(() => this._getAdminListUsers(this._currentPage)),
      ).subscribe(() => { this.loading = false; }, () => { this.loading = false; });
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
          const ids = this.selection.selected.map(item => item.id);
          return this._usersService.deleteUsers(ids);
        }),
        switchMap(() => this._getAdminListUsers(this._currentPage))
      ).subscribe(() => { this.loading = false; }, () => { this.loading = false; });
  }

  private _getActivitiesByCompany(company) {
    const activities = [];
    if (company) {
      for (let i = 0; i < this._activityNames.length; i++) {
        const activityName = this._activityNames[i];
        if (!activityName) {
          continue;
        }
        if (company[activityName.embeddedName] && company[activityName.embeddedName].length > 0) {
          activities.push(activityName['name' + this._config.locale]);
        }
      }
    }
    return activities.length > 0 ? activities : ['Нет видов деятельности'];
  }

  private _getAdminListUsers(page = 1): Observable<any> {
    const filters: any = this.formGroup.value;
    filters.dateCreateFrom = filters.dateCreateFrom && moment(filters.dateCreateFrom).format('YYYY-MM-DD HH:mm') || null;
    filters.dateCreateTo = filters.dateCreateTo && moment(filters.dateCreateTo).format('YYYY-MM-DD HH:mm') || null;
    const query = {
      adminLevel: 0,
      person: 1, // 1 - физ.лицо, 2 - юр.лицо, 0 - все
      ...filters
    };
    this.loading = true;
    return this._usersService.getAdminListUsers(query, page)
      .pipe(
        map((res: any) => {
          this.pageSize = res.pageSize;
          this.pageCount = res.pageCount;
          this.length = res.totalItems;
          this.setTableData(res.users);
        })
      );
  }

  private setTableData(users: any[]) {
    const data: any[] = [];

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const company = user._embedded.companies && user._embedded.companies[0];
      data.push(
        {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          middleName: user.middleName,
          name: `${user.firstName} ${user.lastName}`,
          contacts: { phone: user.phone, email: user.email },
          companies: user._embedded.companies,
          activities: this._getActivitiesByCompany(company),
          status: user.status,
          detailRow: true,
          selectedCompany: company && company.id,
          selectedActivity: this._getActivitiesByCompany(company)[0],
          date: moment(user.dateCreate.date).format('YYYY-MM-DD HH:mm')
        }
      );
    }

    this.dataSource.data = [...data];
  }

  countriesChange(country) {
    this.formGroup.get('country').setValue((country && country.id) ? country.id : null);
  }

  selectedActivityChange(activity) {
    this.formGroup.get('activityKey').setValue((activity && activity.keyName) ? activity.keyName : null);
  }

  onCompanyChange(user) {
    const company = user.companies.find(el => el.id === user.selectedCompany);
    user.activities = this._getActivitiesByCompany(company);
    user.selectedActivity = this._getActivitiesByCompany(company)[0];
  }
}
