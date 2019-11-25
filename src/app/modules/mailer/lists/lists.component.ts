import {Component, OnInit} from '@angular/core';
import {getClientType, MailerService} from '../mailer.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ConfigService} from '@b2b/services/config.service';
import {map, startWith, switchMap, tap} from 'rxjs/operators';
import {UserType} from '@b2b/enums';
import {ActivityNameService} from '@b2b/services/activity-name.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'b2b-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.scss']
})
export class ListsComponent implements OnInit {
  formGroup: FormGroup;
  disableAddGroup = false;
  showActivities = false;
  length = 0;
  pageCount = 0;
  pageSize = 0;
  sendGroups: any = [];
  activityNames$: Observable<any>;
  loading = true;

  constructor(
    private _config: ConfigService,
    private _mailerService: MailerService,
    private _formBuilder: FormBuilder,
    private _activityNameService: ActivityNameService) {
  }

  ngOnInit() {
    this.activityNames$ = this._activityNameService.getActivityNames()
      .pipe(
        tap(() => this.loading = false)
      );
    this.formGroup = this._formBuilder.group({
      userType: 2,
      clientType: this._formBuilder.group({
        buyer: {value: false, disabled: true},
        seller: {value: false, disabled: true},
      }),
      activityNamesId: null
    });
    this.formGroup.get('userType').valueChanges
      .pipe(
        startWith(UserType.FutureUsers)
      )
      .subscribe((userType: number) => {
        if (userType === UserType.FutureUsers) {
          this.formGroup.get('clientType').disable();
        } else {
          this.formGroup.get('clientType').enable();
        }
      });
    this.formGroup.valueChanges
      .pipe(
        startWith(this.formGroup.value),
        switchMap((value: any) => {
          this.sendGroups = [];
          const {userType, clientType} = value;
          this.disableAddGroup = userType === UserType.CurrentUsers && clientType && !(clientType.buyer || clientType.seller);
          this.showActivities = userType === UserType.FutureUsers || clientType && clientType.seller;
          return this._getSendGroups();
        })
      ).subscribe();
  }

  onAddGroupClick() {
    const {userType, clientType} = this.formGroup.value;
    const newGroup = {
      clientType: clientType && getClientType(clientType.buyer, clientType.seller),
      name: 'Новая группа',
      sendGroupActivityNames: this.formGroup.get('activityNamesId').value || [],
      sendGroupCategory: [],
      sendGroupCountry: [],
      sendList: [],
      userType,
    };
    this.sendGroups = [newGroup, ...this.sendGroups];
  }

  onDestroyGroupChanged(group) {
    if (group && group.id) {
      this._mailerService.destroySendGroup(group.id)
        .subscribe(() => {
          this.sendGroups = this.sendGroups.filter(item => item.id !== group.id);
        });
    } else {
      this.sendGroups = this.sendGroups.filter(item => !!item.id);
    }
  }

  private _getSendGroups(page = 1) {
    return this._mailerService.getSendGroups(this.formGroup.value, page)
      .pipe(
        map((res: any) => {
          this.pageSize = res.pageSize;
          this.pageCount = res.pageCount;
          this.length = res.totalItems;
          return this.sendGroups = [...this.sendGroups, ...res.sendGroups];
        })
      );
  }

}
