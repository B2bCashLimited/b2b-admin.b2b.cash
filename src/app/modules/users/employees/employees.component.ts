import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {UsersService} from '../users.service';
import {ConfigService} from '@b2b/services/config.service';
import {ActivityNameService} from '@b2b/services/activity-name.service';
import {MatDialog, MatTableDataSource, PageEvent} from '@angular/material';
import {Observable, Subscription} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map, startWith, switchMap, take} from 'rxjs/operators';
import {EmployeeDialogComponent} from './dialogs/employee-dialog/employee-dialog.component';
import {ConfirmDeleteEmployeeDialogComponent} from './dialogs/confirm-delete-employee-dialog/confirm-delete-employee-dialog.component';
import {ClearSubscriptions, clearSubscription} from '@b2b/decorators';

export interface EmployeesTableElement {
  id: number;
  adminLevel: number;
  adminPosition: number;
  email: string;
  firstName: string;
  lastName: string;
  middleName: string;
  password: string;
  phone: string;
}

@ClearSubscriptions()
@Component({
  selector: 'b2b-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit, OnDestroy {
  formGroup: FormGroup;
  pageCount = 0;
  pageSize = 0;
  length = 0;
  roles: any[];
  displayedColumns: string[] = ['name', 'roles', 'positions', 'actions'];
  dataSource = new MatTableDataSource<EmployeesTableElement>();

  private _currentPage: number;
  private _usersSub: Subscription;
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
      adminLevel: '1,2',
      adminPosition: '',
    });
    this._usersService.getAdminPositions()
      .subscribe((roles: any) => this.roles = roles);
    this.formGroup.valueChanges
      .pipe(
        startWith(this.formGroup.value),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(() => this._getAdminListUsers())
      ).subscribe(() => { this.loading = false; }, () => { this.loading = false; });
  }
  
  ngOnDestroy(): void {
  }
  
  getPage(pageEvent: PageEvent): void {
    const pageIndex = pageEvent.pageIndex + 1;
    this._currentPage = pageIndex <= this.pageCount ? Math.min(pageIndex, this.pageCount) : 1;
    clearSubscription(this._usersSub);
    this._usersSub = this._getAdminListUsers(this._currentPage).subscribe();
  }

  onAddNewEmployeeClick(): void {
    this._matDialog.open(EmployeeDialogComponent, {
      width: '500px',
      data: {},
      disableClose: true,
    }).afterClosed()
      .pipe(
        filter((res) => res && !!res),
        switchMap((res: any) => this._usersService.registerUser(res)),
        switchMap(() => this._getAdminListUsers(this._currentPage)),
      ).subscribe(() => { this.loading = false; }, () => { this.loading = false; });
  }

  onEditUserClick(employee: any): void {
    this._matDialog.open(EmployeeDialogComponent, {
      width: '500px',
      data: {employee},
      disableClose: true,
    }).afterClosed()
      .pipe(
        filter((res) => res && !!res),
        switchMap((res: any) => this._usersService.updateUser(employee.id, res)),
        switchMap(() => this._getAdminListUsers(this._currentPage)),
      ).subscribe(() => { this.loading = false; }, () => { this.loading = false; });
  }

  onDestroyUserClick(employee: any): void {
    this._matDialog.open(ConfirmDeleteEmployeeDialogComponent, {
      width: '500px',
      disableClose: true,
    }).afterClosed()
      .pipe(
        filter((res) => res && !!res),
        switchMap(() => this._usersService.deleteUsers([employee.id])),
      )
      .subscribe(() => {
        this.dataSource.data = this.dataSource.data.filter(item => item.id !== employee.id);
      });
  }

  private _getAdminListUsers(page = 1): Observable<any> {
    const {adminLevel, adminPosition} = this.formGroup.value;
    const query = {
      ...this.formGroup.value,
      adminPosition: adminLevel !== 1 ? adminPosition : '',
    };
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
    const data: EmployeesTableElement[] = [];

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      data.push(
        {
          adminLevel: user.adminLevel,
          adminPosition: user.adminPosition.id,
          email: user.email,
          firstName: user.firstName,
          id: user.id,
          lastName: user.lastName,
          middleName: user.middleName,
          password: user.password,
          phone: user.phone,
        }
      );
    }

    this.dataSource.data = [...data];
  }

  onSelectedRoleChanged(adminPosition: number, userId: number) {
    this._usersService.changeAdminPosition({userId, adminPosition})
      .subscribe(() => {
        const user = this.dataSource.data.find(item => item.id === userId);
        user.adminPosition = adminPosition;
      });
  }

}
