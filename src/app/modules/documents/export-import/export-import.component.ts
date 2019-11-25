import { Component, OnDestroy, OnInit } from '@angular/core';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { MatDialog, PageEvent } from '@angular/material';
import { Document1C, Settings } from '@b2b/models';
import { InvoicesService } from '@b2b/services/invoices.service';
import { ConfigService } from '@b2b/services/config.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Observable, Subject, Subscription } from 'rxjs';
import { SuccessSaveDateComponent } from './dialogs/success-save-date/success-save-date.component';
import { removeEmptyProperties } from '@b2b/utils';
import { clearSubscription } from '@b2b/decorators';
import * as moment from 'moment';

@Component({
  selector: 'b2b-export-import',
  templateUrl: './export-import.component.html',
  styleUrls: ['./export-import.component.scss']
})
export class ExportImportComponent implements OnInit, OnDestroy {

  displayedColumnsImport: string[] = ['number', 'id', 'date', 'company-name', 'accrual', 'currency'];
  formGroup: FormGroup;
  sendingDaySelectedPeriods = [{
    type: 'schedule',
    dates: []
  }];
  lastPaymentDaySelectedPeriods: any[] = [{
    type: 'schedule',
    dates: []
  }];
  actsFrequencySelectedPeriods = [{
    type: 'schedule',
    dates: []
  }];
  sendingDay: number;
  actFrequencyDay: number;
  lastPaymentDay: number;
  isPending = false;
  existedSendingDate = [];
  existedLastPaymentDate = [];
  existedActFrequencyDate = [];
  disableInvoices = true;
  pageCount = 0;
  pageSize = 0;
  pageIndex = 0;
  totalItems = 0;
  isLoading = false;
  globalSettings: Settings[] = [];
  documents1C: Document1C[] = [];
  daysOfWeek = [
    {
      label: 'Понедельник',
      value: 1
    },
    {
      label: 'Вторник',
      value: 2
    },
    {
      label: 'Среда',
      value: 3
    },
    {
      label: 'Четверг',
      value: 4
    },
    {
      label: 'Пятница',
      value: 5
    },
    {
      label: 'Суббота',
      value: 6
    },
    {
      label: 'Воскресенье',
      value: 7
    },
  ];

  actDateFrequency = new FormControl(0);
  dayOfWeek = new FormControl(1);

  startDate = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 13, 0, 0);
  finishDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59);

  settingsMinDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  settingsMaxDate = new Date(new Date().getFullYear(), new Date().getMonth(), 28);

  private _currentPage = 1;
  private _pageSub: Subscription;
  private _unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private _matDialog: MatDialog,
    private _invoicesService: InvoicesService,
    private _config: ConfigService,
    private _formBuilder: FormBuilder) {
  }

  ngOnDestroy(): void {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }

  ngOnInit(): void {
    this._initFormGroup();
    this._getGlobalSettings();
    this._handleSettingsPeriod();
    this._handleSearchByCompany();
  }

  /**
   * Fires an event every time date periods changed
   */
  onSendingDayPeriodChanged(evt: Date[]) {
    if (evt && evt.length > 0) {
      this.sendingDay = evt[0].getDate();
    }
  }

  /**
   * Fires an event every time date periods changed
   */
  onLastPaymentDayPeriodChanged(evt: Date[]) {
    if (evt && evt.length > 0) {
      this.lastPaymentDay = evt[0].getDate();
    }
  }

  /**
   * Fires an event every time act date frequency changed
   */
  onActFrequencyDayPeriodChanged(evt: Date[]) {
    if (evt && evt.length > 0) {
      this.actFrequencyDay = evt[0].getDate();
    }
  }

  onSendingDayObjectAdded(obj: any): void {
    this.sendingDaySelectedPeriods.push(obj);
  }

  onLastPaymentDayObjectAdded(obj: any): void {
    this.lastPaymentDaySelectedPeriods.push(obj);
  }

  onActDateFrequencyDayObjectAdded(obj: any): void {
    this.lastPaymentDaySelectedPeriods.push(obj);
  }

  /**
   * Sets Sending days params
   */
  setDayParams(type: number): void {
    if (!this.isPending && type && (type === 1 || type === 2)) {
      this.isPending = true;
      const data: any = {
        name: type === 1 ? 'invoiceSendDate' : 'invoiceLastPayDate',
        value: type === 1 ? this.sendingDay : this.lastPaymentDay
      };

      this._invoicesService.setParams(data)
        .pipe(takeUntil(this._unsubscribe$))
        .subscribe(() => {
          this.isPending = false;
          this._matDialog.open(SuccessSaveDateComponent);
        }, () => this.isPending = false, () => this.isPending = false);
    }
  }

  /**
   * Fires an event every time page changed
   */
  onPageChanged(evt: PageEvent): void {
    const pageIndex = evt.pageIndex + 1;
    this._currentPage = pageIndex <= this.pageCount ? Math.min(pageIndex, this.pageCount) : 1;
    clearSubscription(this._pageSub);
    this._pageSub = this._getDocuments1C(this.formGroup.value)
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe(() => this.isLoading = false, () => this.isLoading = false);
  }

  /**
   * Turns on/off system
   */
  setSwitchSystemParams(): void {
    if (!this.isPending) {
      this.isPending = true;
      this.disableInvoices = !this.disableInvoices;

      const data: any = {
        name: 'disableInvoices',
        value: this.disableInvoices
      };

      this._invoicesService.setParams(data)
        .pipe(takeUntil(this._unsubscribe$))
        .subscribe(() => this.isPending = false, () => this.isPending = false);
    }
  }

  /**
   * Retrieves invoices list
   */
  showDocuments1C(): void {
    if (!this.isPending) {
      this.isPending = true;
      const data: any = removeEmptyProperties(this.formGroup.value);

      data.dateFrom = moment(data.dateFrom).format('YYYY-MM-DD HH:mm');
      data.dateTo = moment(data.dateTo).format('YYYY-MM-DD HH:mm');

      this._getDocuments1C(data)
        .pipe(takeUntil(this._unsubscribe$))
        .subscribe(() => {
          this.isLoading = false;
          this.isPending = false;
        }, () => {
          this.isLoading = false;
          this.isPending = false;
        });
    }
  }

  /**
   * Saves import settings
   */
  saveImportSettings(): void {
    if (!this.isPending) {
      this.isPending = true;
      const {importTimeFrom, importTimeTo, importDateTimes, importDateDay} = this.formGroup.value;
      const importTimeFromData: any = {
        name: 'importTimeFrom',
        value: importTimeFrom
      };
      const importTimeToData: any = {
        name: 'importTimeTo',
        value: importTimeTo
      };
      const importDateTimesData: any = {
        name: 'importDateTimes',
        value: importDateTimes === '3' ? null : importDateTimes
      };
      const importDateDayData: any = {
        name: 'importDateDay',
        value: importDateDay
      };

      this._invoicesService.setParams(importTimeFromData)
        .pipe(
          switchMap(() => this._invoicesService.setParams(importTimeToData)),
          switchMap(() => this._invoicesService.setParams(importDateTimesData)),
          switchMap(() => this._invoicesService.setParams(importDateDayData)),
          takeUntil(this._unsubscribe$)
        )
        .subscribe(() => this.isPending = false, () => this.isPending = false);
    }
  }

  /**
   * Sets acts frequency day or day of week
   */
  setActFrequencyDate(): void {
    if (!this.isPending) {
      this.isPending = true;
      const actPeriodType: any = {
        name: 'actPeriodType',
        value: this.actDateFrequency.value
      };
      const actPeriodDay: any = {
        name: 'actPeriodDay',
        value: this.actDateFrequency.value === 0 ? this.actFrequencyDay : this.dayOfWeek.value
      };

      this._invoicesService.setParams(actPeriodType)
        .pipe(
          switchMap(() => this._invoicesService.setParams(actPeriodDay)),
          takeUntil(this._unsubscribe$)
        )
        .subscribe(() => this.isPending = false, () => this.isPending = false);
    }
  }

  /**
   * Form group initialization
   */
  private _initFormGroup(): void {
    this.formGroup = this._formBuilder.group({
      importDateTimes: 1,
      importDateDay: {value: null, disabled: true},
      searchByCompany: 0,
      companyName: {value: null, disabled: true},
      importTimeFrom: null,
      importTimeTo: {value: null, disabled: true},
      dateFrom: this.startDate,
      dateTo: this.finishDate,
    });
  }

  /**
   * Retrieves documents list by given filters
   */
  private _getDocuments1C(data: any): Observable<any> {
    this.isLoading = true;
    return this._invoicesService.get1CDocuments(data, this._currentPage)
      .pipe(
        map((res: any) => {
          this.pageSize = res.page_size;
          this.pageCount = res.page_count;
          this.totalItems = res.total_items;
          this.documents1C = res.documents1C;
        })
      );
  }

  /**
   * Retrieves global settings
   */
  private _getGlobalSettings(): void {
    this._invoicesService.getGlobalSettings()
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe((res: Settings[]) => {
        this.globalSettings = res;

        this.globalSettings.forEach(setting => {
          if (setting.key === 'invoiceSendDate') {
            this.sendingDay = +setting.value;
            this.existedSendingDate = [{
              date: new Date(new Date().getFullYear(), new Date().getMonth(), this.sendingDay)
            }];
          } else if (setting.key === 'invoiceLastPayDate') {
            this.lastPaymentDay = +setting.value;
            this.existedLastPaymentDate = [{
              date: new Date(new Date().getFullYear(), new Date().getMonth(), this.lastPaymentDay)
            }];
          }

          if (setting.key === 'disableInvoices') {
            this.disableInvoices = setting.value;
          }

          if (this.formGroup.get(setting.key)) {
            this.formGroup.get(setting.key).setValue(setting.value);
          }

          if (setting.key === 'importDateDay' && setting.value) {
            this.formGroup.get('importDateTimes').setValue('3');
          }

          if (setting.key === 'actPeriodType' && setting.value) {
            this.actDateFrequency.setValue(+setting.value);
          }

          if (setting.key === 'actPeriodDay' && setting.value) {
            if (this.actDateFrequency.value === 0) {
              this.actFrequencyDay = +setting.value;
              this.existedActFrequencyDate = [{
                date: new Date(new Date().getFullYear(), new Date().getMonth(), this.actFrequencyDay)
              }];
            } else if (this.actDateFrequency.value === 1) {
              this.dayOfWeek.setValue(+setting.value);
            }
          }
        });
      });
  }

  /**
   * Handles `settingsPeriod` form control
   */
  private _handleSettingsPeriod(): void {
    this.formGroup.get('importDateTimes').valueChanges
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe((res: string) => {
        if (res === '2') {
          this.formGroup.get('importTimeTo').enable();
        } else {
          this.formGroup.get('importTimeTo').disable();
        }

        if (res === '3') {
          this.formGroup.get('importDateDay').enable();
        } else {
          this.formGroup.get('importDateDay').disable();
        }
      });
  }

  /**
   * Handles `searchByCompany` form control
   */
  private _handleSearchByCompany(): void {
    this.formGroup.get('searchByCompany').valueChanges
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe(res => {
        if (res) {
          this.formGroup.get('companyName').enable();
        } else {
          this.formGroup.get('companyName').disable();
        }
      });
  }

}
