import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { of, Subscription, Observable } from 'rxjs';
import { ConfigService } from '@b2b/services/config.service';
import { ActivityService, normalizeCompanyActivities } from '../activity.service';
import { ActivitiesEvents } from '@b2b/enums';
import { debounceTime, distinctUntilChanged, filter, first, map, startWith, switchMap, tap } from 'rxjs/operators';
import { MatDialog, PageEvent } from '@angular/material';
import { CompanyModerationService } from '../../companies/company-moderation.service';
import { LocationService } from '@b2b/services/location.service';
import { cloneDeep } from 'lodash';
import { ActivityNameService } from '@b2b/services/activity-name.service';
import { ActivityNameModel, Country } from '@b2b/models';
import { SocketService } from '@b2b/services/socket.service';
import { clearSubscription } from '@b2b/decorators';
import { ActivatedRoute, Router } from '@angular/router';
import { SetBonusDialogComponent } from './dialogs/set-bonus-dialog/set-bonus-dialog.component';
import { MatCheckboxChange } from '@angular/material/typings/checkbox';

@Component({
  selector: 'b2b-activities-index',
  templateUrl: './activities-index.component.html',
  styleUrls: ['./activities-index.component.scss'],
  providers: [CompanyModerationService]
})
export class ActivitiesIndexComponent implements OnInit, OnDestroy {
  pageCount = 0;
  pageSize = 0;
  length = 0;
  pageIndex = 0;
  companies: any[]; // отфильтрованный массив для компаний
  companiesRaw: any[] = []; // массив для компаний до фильтрации
  activities: ActivityNameModel[] = [];
  formGroup: FormGroup;
  selectedActivity: number;
  selectedCountries: any[];
  countries: any = {};
  companyStatuses = [
    {label: 'Все', value: -1},
    {label: 'Ожидание', value: 0},
    {label: 'Одобрен', value: 1},
    {label: 'Отклонен', value: 2},
    {label: 'Уточнение', value: 3},
  ];
  loading = false;
  totalCounter = 0;
  countries$: Observable<any>;
  activityNames$: Observable<any>;
  countryIds: string;
  countryIdsArr: number[];
  currentPage = 1;
  count = 0;
  companyIdsForBonus: number[] = [];
  selectedActivityName: string;
  isPending = false;
  selectedCategoryId: number;

  private _activitiesSub: Subscription;
  private _changeSub: Subscription;
  private _queryParams = {...this._route.snapshot.queryParams};

  constructor(
    private _socketService: SocketService,
    private _formBuilder: FormBuilder,
    private _config: ConfigService,
    private _locationService: LocationService,
    private _companyService: CompanyModerationService,
    private _activityNameService: ActivityNameService,
    private _activityService: ActivityService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _dialog: MatDialog
  ) {
  }

  ngOnDestroy(): void {
    this._socketService.off(ActivitiesEvents.NotModeratedActivities);
    this._socketService.emit(ActivitiesEvents.NotModeratedActivitiesUnsubscribe);
    if (this._changeSub && !this._changeSub.closed) {
      this._changeSub.unsubscribe();
    }
  }

  ngOnInit() {
    this._initFormGroup();
    this.countries$ = this._locationService.getCountries()
      .pipe(
        map((countries: Country[]) => {
          countries.forEach(c => this.countries[c.id] = c);
          return countries;
        })
      );
    this.activityNames$ = this._activityNameService.getActivityNames()
      .pipe(
        tap((res: ActivityNameModel[]) => {
          this.activities = res;
          this._patchQueryParams();
        }));
    this._socketService.on(ActivitiesEvents.NotModeratedActivities, (companies: any[]) => {
      if (this.formGroup.get('status').value === 0) {
        this.companiesRaw = normalizeCompanyActivities(companies, this._config.serverUrl);
        this.companies = [];
        const companiesCopy = this.filterCompanies(this.companiesRaw);

        this.pageSize = 15;
        this.pageCount = Math.ceil(companiesCopy.length / this.pageSize);
        this.pageIndex = this.currentPage - 1;
        this.length = companiesCopy.length;

        if ((companiesCopy.length - this.companies.length) / this.pageSize > this.currentPage) {
          this.companies = companiesCopy.slice(this.pageIndex * this.pageSize, this.pageSize);
        } else {
          this.companies = companiesCopy.slice(this.pageIndex * this.pageSize);
        }
      }
    });
    this._changeSub = this.formGroup.valueChanges
      .pipe(
        startWith(this.formGroup.value),
        debounceTime(300),
        distinctUntilChanged(),
        tap((value: any) => {
          if (this.count > 0) {
            this.currentPage = 1;
            this._navigateQueryParams(value);
          }

          this.count++;
        }),
        switchMap((value: any) => {
          if (value.status !== 0) {
            if (!value.activityName) {
              this.formGroup.get('activityName').setValue(this.activities[0]);
              this.selectedActivity = this.activities[0].id || null;
              this.selectedActivityName = this.activities[0].nameRu || null;
            }
            this._socketService.emit(ActivitiesEvents.NotModeratedActivitiesUnsubscribe);
            return this._getActivityCompanies(value);
          }

          this.pageSize = 0;
          this.pageCount = 0;
          this.pageIndex = 0;
          this.length = 0;
          this.companies = this.filterCompanies(this.companiesRaw);
          this._socketService.emit(ActivitiesEvents.NotModeratedActivitiesSubscribe);
          return of(null);
        }),
        switchMap(() => {
          const val = this.formGroup.value;
          const body = {
            ...this.formGroup.value
          };
          body.activityName = val.activityName ? val.activityName.id : null;
          return val.status !== 0 && val.countries ? this._activityService.getActivityCounters(body) : of(null);
        }),
      ).subscribe(res => {
        this.loading = false;
        if (this.formGroup.value.status !== 0) {
          this.handleActivityCounter(res);
        }
      }, () => this.loading = false);
  }

  filterCompanies(companiesRaw: any[]): any[] {
    companiesRaw = cloneDeep(companiesRaw);
    const {countries, status} = this.formGroup.value;
    const filtered = [];

    if (status === 0) {
      this.selectedCountries = [];
      this.totalCounter = 0;
      const selectedCountries = countries ? countries.split(',').filter(el => +el !== 0) : [];
      selectedCountries.forEach(el => this.selectedCountries.push({id: +el, count: 0}));
    }

    for (let i = 0; i < companiesRaw.length; i++) {
      const company = companiesRaw[i];
      company.activities = company.activities.filter(activity => this.filterActivity(activity, company));

      if (company.activities.length) {
        filtered.push(company);
      }
    }

    return filtered;
  }

  private _includesStr(str: string, srhStr: string): boolean {
    return str.toLowerCase().includes(srhStr.toLowerCase());
  }

  filterActivity(activity, company) {
    if (!activity.country) { // у некоторых активити не указана страна
      return false;
    }
    const {status, activityName, countries, nameActivity, nameCompany} = this.formGroup.value;
    const actKey = activityName ? activityName.keyName === activity.key : true;
    const countrArr = countries ? countries.split(',').filter(el => +el !== 0) : [];
    const countrBool = countrArr.length ? countrArr.includes(`${activity.country.id}`) : true;
    const statusBool = status === -1 ? true : activity.status === status;
    const compNameMatch = this._includesStr(company.name || '', nameCompany) || this._includesStr(company.shortName || '', nameCompany);

    if (statusBool && actKey && countrBool && this._includesStr(activity.name, nameActivity) && compNameMatch) {
      if (status === 0) {
        const selCou = this.selectedCountries.find(el => +el.id === +activity.country.id);
        if (selCou) {
          selCou.count++;
        }
        this.totalCounter++;
      }
      return true;
    }
  }

  getPage(pageEvent: PageEvent): void {
    const pageIndex = pageEvent.pageIndex + 1;
    this.currentPage = pageIndex <= this.pageCount ? Math.min(pageIndex, this.pageCount) : 1;
    this._router.navigate([],
      {
        relativeTo: this._route,
        queryParams: {page: this.currentPage},
        queryParamsHandling: 'merge'
      });

    if (this.formGroup.get('status').value !== 0) {
      clearSubscription(this._activitiesSub);
      this._activitiesSub = this._getActivityCompanies(this.formGroup.value, this.currentPage)
        .pipe(
          switchMap(() => {
            const val = this.formGroup.value;
            const body = {
              ...this.formGroup.value
            };
            this.loading = false;
            body.activityName = val.activityName ? val.activityName.id : null;
            return val.status !== 0 && val.countries ? this._activityService.getActivityCounters(body) : of(null);
          })
        )
        .subscribe(res => this.handleActivityCounter(res), () => this.loading = false);
    }
  }

  handleActivityCounter(res): void {
    this.selectedCountries = res;
  }

  onSelectedActivityChanged(activity: any): void {
    this.selectedActivity = activity ? activity.id : null;
    this.selectedActivityName = activity ? activity.nameRu : null;
    this.formGroup.get('activityName').patchValue(activity);
    this.companyIdsForBonus = [];
  }

  onSelectCountriesChanged(evt: Country[]): void {
    this.countryIds = evt.map(item => item.id).join(',');
    this.formGroup.get('countries').patchValue(this.countryIds);
  }

  addCompanyForBonus(evt: MatCheckboxChange, company: any, activity: any): void {
    activity.isBonusSelected = evt.checked;
    const hasSelectedBonus = (company.activities as any[]).some(value => value.isBonusSelected);

    if (!this.companyIdsForBonus.includes(+company.id)) {
      this.companyIdsForBonus.push(+company.id);
    } else if (!hasSelectedBonus) {
      this.companyIdsForBonus = this.companyIdsForBonus.filter(value => value !== +company.id);
    }
  }

  onSelectedCategory(evt: any): void {
    this.selectedCategoryId = evt && evt.id || null;
    this.formGroup.get('category').setValue(evt && evt.id || null);
  }

  setBonus(): void {
    if (!this.isPending) {
      let amount: number;
      this.isPending = true;

      this._dialog.open(SetBonusDialogComponent, {
        width: '500px',
        disableClose: true,
        data: {
          count: this.companyIdsForBonus.length,
          activityName: this.selectedActivityName
        }
      })
        .afterClosed()
        .pipe(
          filter((res: number) => {
            if (!!res && res > 0) {
              amount = res;
              return true;
            } else {
              this.isPending = false;
            }
          }),
          switchMap((res: number) => this._companyService.setBonusForCompanies(this.companyIdsForBonus, res))
        )
        .subscribe(() => {
          this._socketService.emit('make_gift', {companies: this.companyIdsForBonus, currencyId: 28, amount: amount});
          this.companyIdsForBonus.forEach(id => {
            this.companies.forEach(company => {
              if (+company.id === id) {
                company.isGiftGotten = !company.isGiftGotten;
              }
            });
          });
          this.isPending = false;
        }, () => this.isPending = false);
    }
  }

  private _initFormGroup(): void {
    this.formGroup = this._formBuilder.group({
      status: 0,
      countries: '',
      activityName: null,
      nameCompany: '',
      nameActivity: '',
      category: null
    });
  }

  private _patchQueryParams(): void {
    if (this._queryParams.status) {
      this._queryParams.status = +this._queryParams.status;
    }

    if (this._queryParams.filterActivityName) {
      this.selectedActivity = +this._queryParams.filterActivityName;
      const filterActivityName = this.activities.find(activity => activity.id === +this._queryParams.filterActivityName);
      this.selectedActivityName = filterActivityName.nameRu;
      this.formGroup.get('activityName').setValue(filterActivityName, {emitEvent: false});
    }

    if (this._queryParams.countries) {
      this.countryIds = this._queryParams.countries;
      this.countryIdsArr = (this._queryParams.countries as string).split(',').map(id => +id);
      this.formGroup.get('countries').setValue(this.countryIds, {emitEvent: false});
    }

    if (this._queryParams.page) {
      this.currentPage = +this._queryParams.page;
    }

    this.formGroup.patchValue(this._queryParams, {emitEvent: false});

    if (this._queryParams.status && +this._queryParams.status > 0 && Object.keys(this._queryParams).length > 0) {
      this._navigateQueryParams(this._queryParams);
      this._getActivityCompanies(this.formGroup.value, this.currentPage)
        .pipe(first())
        .subscribe(() => this.loading = false, () => this.loading = false);
    }
  }

  private _getActivityCompanies(value, page = 1) {
    this.loading = true;
    const obj = {
      ...value,
      page: page,
      activityName: value.activityName && value.activityName.id || 1,
    };
    return this._activityService.getActivityCompanies(obj, page)
      .pipe(
        map((res: any) => {
          this.loading = false;
          this.pageSize = res.pageSize;
          this.pageCount = res.pageCount;
          this.pageIndex = res.page - 1;
          this.length = res.totalItems;
          this.totalCounter = res.totalItems;
          this.companiesRaw = normalizeCompanyActivities(res.companies, this._config.serverUrl);
          this.companies = this.filterCompanies(this.companiesRaw);
        })
      );
  }

  private _navigateQueryParams(value: any): void {
    this._router.navigate([],
      {
        relativeTo: this._route,
        queryParams: {
          status: +value.status,
          filterActivityName: +this.selectedActivity,
          countries: value.countries,
          nameActivity: value.nameActivity,
          nameCompany: value.nameCompany,
          page: this.currentPage
        },
        queryParamsHandling: 'merge'
      });
  }

}
