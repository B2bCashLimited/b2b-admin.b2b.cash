import {Component, OnDestroy, OnInit} from '@angular/core';
import {forkJoin, of, Subscription} from 'rxjs';
import {FormControl} from '@angular/forms';
import {DateAdapter, MatDialog} from '@angular/material';
import {ConfigService} from '@b2b/services/config.service';
import {ChatService} from '../chat.service';
import {clearSubscription} from '@b2b/decorators';
import * as moment from 'moment';
import {ChatSettings} from '../models/chat-settings';
import {Consultant} from '../models/consultant';
import {ConsultantList} from '../models/consultant-list';
import {switchMap} from 'rxjs/operators';
import {NotEnoughConsultantsDialogComponent} from '../popups/not-enough-consultants-dialog/not-enough-consultants-dialog.component';
import {ConsultantSettingsDialogComponent} from '../popups/consultant-settings-dialog/consultant-settings-dialog.component';

@Component({
  selector: 'b2b-manager',
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.scss']
})
export class ManagerComponent implements OnInit, OnDestroy {

  consultantList: ConsultantList;
  consultants: Consultant[] = [];
  date: FormControl;
  maxAvrResponseTime = 60;
  settings = {};
  settingsSaveInProgress = false;

  private _consListSub: Subscription;
  private _getSettingsSub: Subscription;
  private _formValueSub: Subscription;
  private _notEnoughDialogSub: Subscription;
  private _settingsDialogSub: Subscription;

  constructor(private adapter: DateAdapter<any>,
              public config: ConfigService,
              private dialog: MatDialog,
              private chatService: ChatService) {
  }

  ngOnInit() {
    this.adapter.setLocale(this.config.locale.toLowerCase());
    this.initForm();
    this.getConsultants();
    this.getSettings();
  }

  initForm() {
    this.date = new FormControl(null);
    this._formValueSub = this.date.valueChanges.subscribe(value => {
      this.getConsultants(value);
    });
  }

  getConsultants(date?: { begin, end }) {
    clearSubscription(this._consListSub);
    if (date) {
      this._consListSub = this.chatService.getConsultantsList(moment(date.begin).format('YYYY-MM-DD'),
        moment(date.end).format('YYYY-MM-DD'))
        .subscribe(value => {
          this.consultantList = value;
          this.consultants = value.consultants || [];
        });
    } else {
      this._consListSub = this.chatService.getConsultantsList().subscribe(value => {
        this.consultantList = value;
        this.consultants = value.consultants || [];
      });
    }
  }

  getSettings() {
    this._getSettingsSub = this.chatService.getSettings().subscribe(value => {
      const allSettings = value['_embedded']['settings'];
      this.filterSettings(allSettings);
    });
  }

  filterSettings(settings: { id: string, key: string, value: string | number }[]) {
    settings.map(value1 => {
      if (value1.key === ChatSettings.NUMBER_OF_CLIENTS) {
        this.settings[ChatSettings.NUMBER_OF_CLIENTS] = value1.value;
      }
      if (value1.key === ChatSettings.AVARIYNOE_TIME) {
        this.settings[ChatSettings.AVARIYNOE_TIME] = value1.value;
      }
      if (value1.key === ChatSettings.FULL_AVARIYNOE_TIME) {
        this.settings[ChatSettings.FULL_AVARIYNOE_TIME] = value1.value;
      }
    });
    this.settingsSaveInProgress = false;
  }

  openNotEnoughConsultantsDialog() {
    clearSubscription(this._notEnoughDialogSub);
    const dialog = this.dialog.open(NotEnoughConsultantsDialogComponent);
    this._notEnoughDialogSub = dialog.afterClosed().subscribe(value => {
    });
  }

  openSettingsDialog() {
    clearSubscription(this._settingsDialogSub);
    const dialog = this.dialog.open(ConsultantSettingsDialogComponent, {
      width: '400px',
      data: {
        settings: this.settings
      }
    });
    this._settingsDialogSub = dialog.afterClosed().pipe(switchMap(value => {
      if (value) {
        this.settingsSaveInProgress = true;
        const settings = {};
        settings[ChatSettings.NUMBER_OF_CLIENTS] = value.clientsNumber;
        settings[ChatSettings.AVARIYNOE_TIME] = value.specialTime.mins * 60 + value.specialTime.secs;
        settings[ChatSettings.FULL_AVARIYNOE_TIME] = value.megaSpecialTime.mins * 60 + value.megaSpecialTime.secs;
        const subs = [];
        Object.keys(settings).map(value1 => {
          subs.push(this.chatService.setSettingsParam(value1, settings[value1]));
        });
        return forkJoin(subs);
      }
      return of(null);
    })).subscribe(value => {
      if (value) {
        this.getConsultants(this.date.value);
        this.filterSettings(value);
      }
    });
  }

  consIsTrashTier(cons: Consultant): boolean {
    return cons.stat.responseTime > this.settings[ChatSettings.AVARIYNOE_TIME];
  }

  consHasRights(cons: Consultant, perm: string) {
    return cons.roles.indexOf(perm) !== -1;
  }

  secondsToDateString(secs: number, format: string = 'mm:ss'): string {
    if (secs / 60 >= 60) {    // если больше часа
      return moment.unix(secs).utc().format('HH:mm:ss');
    }
    return moment.unix(secs).utc().format(format);
  }

  notEnoughConsultants(): boolean {
    if (this.consultantList) {
      return this.consultantList.totalResponseTime > +this.settings[ChatSettings.FULL_AVARIYNOE_TIME];
    }
    return false;
  }

  consPhoto(cons: Consultant): string {
    return cons.photos.length ? (this.config.serverUrl + cons.photos[0].link) : '../assets/img/stubs/consultant_nophoto.png';
  }

  ngOnDestroy(): void {
  }
}
