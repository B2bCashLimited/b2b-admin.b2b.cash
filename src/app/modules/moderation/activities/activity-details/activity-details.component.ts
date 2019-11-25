import { ActivityNameGroups } from '@b2b/enums';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConfigService } from '@b2b/services/config.service';
import { ActivityService } from '../activity.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { SocketService } from '@b2b/services/socket.service';
import { Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';
import { DateRangeComponent } from '@b2b/shared/dialogs';
import * as moment from 'moment';

@Component({
  selector: 'b2b-activity-details',
  templateUrl: './activity-details.component.html',
  styleUrls: ['./activity-details.component.scss']
})
export class ActivityDetailsComponent implements OnInit, OnDestroy {

  company: any;
  activity: any;
  activityNameId: number;
  activityId: number;
  formGroup: FormGroup;
  serverUrl = this._config.serverUrl;
  isPending = false;

  startDate: string | Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  finishDate: string | Date = new Date(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());

  readonly ACTIVITY_NAMES = {
    Supplier: 1,                             // Поставщик
    Manufacturer: 2,                      // Завод-изготовитель
    CustomsRepresentativeWithoutLicense: 3,  // Таможенный представитель без лицензии
    CustomsRepresentativeWithLicense: 4,     // Таможенный представитель с лицензией
    InternationalRoadHauler: 5,              // Международный автоперевозчик
    DomesticRoadHauler: 6,                   // Автоперевозки внутри страны
    InternationalRailCarriers: 7,            // Международные Ж/Д перевозки
    DomesticRailCarriers: 8,                 // Ж/Д перевозки внутри страны
    InternationalAirCarriers: 9,             // Международные авиаперевозки
    DomesticAirCarriers: 10,                 // Авиаперевозки внутри страны
    SeaLines: 11,                            // Морские линии
    RiverLines: 12,                          // Речные линии внутри страны
  };

  private _unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private _config: ConfigService,
    private _socketService: SocketService,
    private _formBuilder: FormBuilder,
    private _route: ActivatedRoute,
    private _router: Router,
    private _snack: MatSnackBar,
    private _matDialog: MatDialog,
    private _activityService: ActivityService) {
  }

  ngOnDestroy(): void {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }

  ngOnInit(): void {
    this._initFormGroup();
    const {companyId, activityId, activityName} = this._route.snapshot.queryParams;

    this.activityNameId = +activityName || null;
    this.activityId = +activityId || null;

    this._activityService.getCompanyById(companyId)
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe(res => this.company = res);

    this._activityService.getCompanyByActivityNameId(activityId, activityName)
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe((res: any) => {
        this.activity = res;
        this.formGroup.get('freeUsage').patchValue(res.freeUsage);
      });
  }

  onModerateCompanyClick(status: number): void {
    const {companyId, activityId, activityName, activityParentKeyName} = this._route.snapshot.queryParams;

    this._activityService.updateAcivityRPC(status, activityId, activityName, this.formGroup.value.message)
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe((res: any) => {
        if (res.message === 'Activity Updated') {
          this._snack.open('Статус обновлен', 'Ок', {duration: 3000});
        }

        this._socketService.emit('activity_status_update', {
          activity_id: activityId,
          activity_type: activityParentKeyName,
          status: status
        });

        if (status === 1) {
          let emitEvent: string;
          if (ActivityNameGroups.products.includes(+activityName)) {
            emitEvent = 'tariff_product_update';
          } else if (ActivityNameGroups.routes.includes(+activityName)) {
            emitEvent = 'tariff_route_update';
          } else if (ActivityNameGroups.customsRoutes.includes(+activityName)) {
            emitEvent = 'tariff_custom_route_update';
          }

          this._socketService.emit(emitEvent, {
            companyId: +companyId,
            activityNameId: +activityName,
            activityId: +activityId
          });
        }

        this._router.navigate(['moderation/activities']);
      });
  }

  onBackClick(): void {
    const {status, filterActivityName, countries, nameActivity, nameCompany, page} = this._route.snapshot.queryParams;
    const queryParams: any = {
      status,
      filterActivityName,
      countries,
      nameActivity,
      nameCompany,
      page
    };
    this._router.navigate(['moderation/activities'], {queryParams});
  }

  /**
   * Opens date picker dialog to choose periods
   */
  onDateChange() {
    if (this.formGroup.get('freeUsage').value) {
      const data: any = {
        minDate: this.startDate,
        startDate: this.startDate,
        finishDate: this.finishDate,
      };

      this._matDialog.open(DateRangeComponent, {
        width: '400px',
        height: 'auto',
        data
      }).afterClosed()
        .pipe(first())
        .subscribe(resp => {
          if (resp) {
            const [dateFrom, dateTo] = resp;

            if (resp.length === 2) {
              if (dateFrom.getTime() < dateTo.getTime()) {
                this.startDate = dateFrom;
                this.finishDate = dateTo || dateFrom;
              } else {
                this.startDate = dateTo || dateFrom;
                this.finishDate = dateFrom;
              }
            } else if (resp.length === 1) {
              this.startDate = this.finishDate = dateFrom;
            }

            this.formGroup.get('start').setValue(moment(this.startDate).format('YYYY-MM-DD'));
            this.formGroup.get('end').setValue(moment(this.finishDate).format('YYYY-MM-DD'));
          }
        });
    }
  }

  /**
   * Sets free usage period
   */
  setFreeUsage(): void {
    const {freeUsage, start, end} = this.formGroup.value;
    const data: any = {
      activityNameId: this.activityNameId,
      activityId: this.activityId,
      enabled: freeUsage ? 1 : 0,
      start: start,
      end: end,
    };
    this.isPending = true;

    this._activityService.setFreeUsage(data)
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe(() => this.isPending = false, () => this.isPending = false);
  }

  private _initFormGroup(): void {
    this.formGroup = this._formBuilder.group({
      correct: null,
      reject: null,
      message: '',
      freeUsage: false,
      start: '',
      end: ''
    });
  }
}
