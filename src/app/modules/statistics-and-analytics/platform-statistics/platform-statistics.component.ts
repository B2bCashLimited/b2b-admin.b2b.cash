import { Component, OnDestroy, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { StatisticsAnalyticsService } from '@b2b/services/statistics-analytics.service';
import { ActivityNameModel, Category, City, Country, CustomsPost } from '@b2b/models';
import { LocationService } from '@b2b/services/location.service';
import { ActivityNames } from '@b2b/enums';
import { FormBuilder, FormGroup } from '@angular/forms';
import { removeEmptyProperties } from '@b2b/utils';
import { pick } from 'lodash';
import { MatDialog, PageEvent } from '@angular/material';
import { ConfigService } from '@b2b/services/config.service';
import { EmailListComponent } from './dialogs/email-list/email-list.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'b2b-platform-statistics',
  templateUrl: './platform-statistics.component.html',
  styleUrls: ['./platform-statistics.component.scss']
})
export class PlatformStatisticsComponent implements OnInit, OnDestroy {

  displayedStatisticsColumns: string[] = [
    'activityNames',
    'supplier',
    'manufacturer',
    'customsWithoutLicense',
    'customsBroker',
    'internationalTrucker',
    'domesticTrucker',
    'internationalRailCarrier',
    'domesticRailCarrier',
    'internationalAirCarrier',
    'domesticAirCarrier',
    'seaCarrier',
    'riverCarrier',
    // 'warehouseRent',
    // 'warehouse',
    'total'
  ];
  displayedStatisticsColumnsCopy: string[] = this.displayedStatisticsColumns.slice();

  displayedGeoStatisticsColumns: string[] = [
    'countries',
    'companies',
    'regions',
    'cities',
    'categories',
    'products',
    'routes',
    'customsClearance',
    'customsClearanceAndDelivery'
  ];

  dealTypes: any[] = [
    {
      value: 'confirmedOrders',
      label: 'Заказ подтвержден'
    },
    {
      value: 'receivedOffers',
      label: 'Поступившие предложения'
    },
    {
      value: 'calculatedOrders',
      label: 'Просчитанные предложения'
    },
    // 'Сделка заключена',
    // 'Назначенные сделки'
  ];

  formGroup: FormGroup;
  serverUrl = this._config.serverUrl;
  date = new Date();
  minDate = new Date(this.date.getFullYear() - 2, this.date.getMonth(), this.date.getDate());
  maxDate = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate());
  customsPosts$: Observable<CustomsPost[]>;
  countries: Country[] = [];
  activities: any[] = [];
  selectedCompanies: any[] = [];
  statisticsLoading = false;
  geoStatisticsLoading = false;
  isRoutePointDisabled = true;
  isProductDisabled = true;
  isPending = false;
  isActivityNamesSelected = false;
  isCompaniesSelected = false;
  reset = false;
  statisticsHeader = 'Общая статистика';
  pointType = 'region';
  pageCount = 0;
  pageSize = 0;
  statisticsPageIndex = 0;
  totalCompanies = 0;
  selectedActivityName = [];
  selectedCountries = null;
  geoStatistics: any;
  statistics: any;
  isActivityDisabled = true;
  isActivityReset = false;
  isProductsActivityNameGroup = false;
  selectedActivityNames: ActivityNameModel[] = [];
  selectedCategoryId: number;
  selectedCategory: Category;
  selectedRegionName: string;
  selectedCityName: string;
  isSelectCityForCustomsPostDisabled = true;
  selectedCompaniesIds: number[] = [];
  selectedProductsIds: number[] = [];
  selectedCityIdForCustomsPost: number;
  selectedLoadingRegion: any = {};
  selectedUnloadingRegion: any = {};

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

  private _selectedLoadingRegion: any = {};
  private _selectedUnloadingRegion: any = {};
  private _queryParams = this._route.snapshot.queryParams;
  private _unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private _statisticsAnalyticsService: StatisticsAnalyticsService,
    private _locationService: LocationService,
    private _config: ConfigService,
    private _formBuilder: FormBuilder,
    private _matDialog: MatDialog,
    private _router: Router,
    private _route: ActivatedRoute,
  ) {
  }

  ngOnDestroy(): void {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }

  ngOnInit(): void {
    this._initFormGroup();
    this._patchQueryParams();
    this._handleFormGroup();
    this._getStatistics();
    this._getGeoStatistics();
    this._handleCityForCustomsPost();
  }

  /**
   * Handles search button
   */
  onSearch(): void {
    this.reset = false;
    this.selectedCompanies = this.formGroup.get('selectedCompanies').value;
    this.isCompaniesSelected = this.selectedCompanies && this.selectedCompanies.length > 0;
    this.isActivityNamesSelected = this.selectedActivityNames.length > 0;
    this.isProductsActivityNameGroup = this.selectedActivityNames.some(value => {
      return value.id === ActivityNames.Supplier || value.id === ActivityNames.ProducerFactory;
    });

    if (this.isCompaniesSelected) {
      this._getCompaniesStatistics();
      this.statisticsHeader = 'Статистика по компаниям';
    } else {
      this._getStatistics();
      this.statisticsHeader = 'Общая статистика';
      this.selectedCompanies = [];
    }

    if (this.isActivityNamesSelected) {
      this.displayedStatisticsColumnsCopy = [];
      this.selectedActivityNames.forEach(activity => {
        this.displayedStatisticsColumns.forEach(item => {
          if (item === activity.keyName) {
            this.displayedStatisticsColumnsCopy.push(item);
          }
        });
      });
      this.displayedStatisticsColumnsCopy.unshift(this.displayedStatisticsColumns[0]);
      this.displayedStatisticsColumnsCopy.push(this.displayedStatisticsColumns[this.displayedStatisticsColumns.length - 1]);
    } else {
      this.displayedStatisticsColumnsCopy = this.displayedStatisticsColumns.slice();
    }
  }

  /**
   * Resets filters
   */
  resetFilters(): void {
    this.reset = true;
    this.isActivityReset = true;
    this.isActivityDisabled = true;
    this.isSelectCityForCustomsPostDisabled = true;
    this.statisticsHeader = 'Общая статистика';
    this.selectedActivityName = [];
    this.selectedActivityNames = [];
    this.selectedCategoryId = null;
    this.selectedCategory = null;
    this.selectedCountries = [];
    this.selectedCompanies = [];
    this.isProductDisabled = true;
    this.isRoutePointDisabled = true;
    this.isActivityNamesSelected = false;
    this.isCompaniesSelected = false;
    this.isProductsActivityNameGroup = false;
    this.selectedRegionName = null;
    this.selectedCityName = null;
    this.selectedCompaniesIds = null;
    this.selectedProductsIds = null;
    this.selectedCityIdForCustomsPost = null;
    this.selectedLoadingRegion = null;
    this._selectedLoadingRegion = null;
    this.selectedUnloadingRegion = null;
    this._selectedUnloadingRegion = null;
    this.formGroup.reset({
      dealTypes: null,
      orderOfferDealId: null,
      selectedActivityNames: null,
      selectedCategoryId: null,
      selectedCountryId: null,
      selectedRegion: null,
      selectedCity: null,
      selectedCityIdForCustomsPost: {value: null, disabled: true},
      selectedCustomsPostId: {value: null, disabled: true},
      selectedCompanies: null,
      dateFrom: null,
      dateTo: null,
      activity: {value: null, disabled: true},
      products: {value: null, disabled: true},
    });
    this.formGroup.updateValueAndValidity();
    this.displayedStatisticsColumnsCopy = this.displayedStatisticsColumns.slice();
    this._getStatistics();
    this._router.navigate([],
      {
        relativeTo: this._route,
        queryParams: null,
      });
  }

  /**
   * Fires an event every time country selected
   */
  onCountriesChanged(evt): void {
    this.formGroup.get('selectedCountryId').setValue(evt && evt.id || null);

    if (!this.formGroup.get('selectedCountryId').value) {
      this.formGroup.get('selectedRegion').reset();
      this.formGroup.get('selectedCity').reset();

      this._router.navigate([],
        {
          relativeTo: this._route,
          queryParams: {
            selectedRegionName: null,
            selectedCityName: null
          },
          queryParamsHandling: 'merge'
        });
    }
  }

  /**
   * Fires an event every time activity name selected
   */
  onSelectedActivityNameChanged(evt: ActivityNameModel[]): void {
    const {
      selectedActivityNames, selectedCityIdForCustomsPost, selectedCustomsPostId, loadingRegion, unloadingRegion, activity, products
    } = this.formGroup.controls;
    const isProductDisabled = evt.some(value => value.id !== ActivityNames.Supplier && value.id !== ActivityNames.ProducerFactory);
    const selectedActivityNamesIds: number[] = [];

    if (evt.length > 0) {
      activity.enable();
      this.isActivityDisabled = false;
      this.isRoutePointDisabled = evt.some(value => {
        return value.id === ActivityNames.Supplier || value.id === ActivityNames.ProducerFactory;
      });

      this.isSelectCityForCustomsPostDisabled = evt.some(value => {
        return value.id !== ActivityNames.CustomsRepresentativeWithoutLicense &&
          value.id !== ActivityNames.CustomsRepresentativeWithLicense;
      });

      if (!this.isRoutePointDisabled) {
        loadingRegion.enable();
        unloadingRegion.enable();
      }
    } else {
      activity.disable();
      activity.reset();
      selectedCityIdForCustomsPost.disable();
      selectedCustomsPostId.disable();
      loadingRegion.disable();
      loadingRegion.reset();
      unloadingRegion.disable();
      unloadingRegion.reset();
      products.disable();
      products.reset();
      this.isRoutePointDisabled = true;
      this.isSelectCityForCustomsPostDisabled = true;
      this.isActivityDisabled = true;
      this.isActivityReset = true;
      this._router.navigate([],
        {
          relativeTo: this._route,
          queryParams: {selectedActivityNames: null},
          queryParamsHandling: 'merge'
        });
    }

    evt.forEach(value => {
      if (value.id !== ActivityNames.CustomsRepresentativeWithoutLicense && value.id !== ActivityNames.CustomsRepresentativeWithLicense) {
        selectedCityIdForCustomsPost.disable();
        selectedCustomsPostId.disable();
        this.selectedCityIdForCustomsPost = null;
      } else {
        selectedCityIdForCustomsPost.enable();
      }

      selectedActivityNamesIds.push(value.id);
      this._setPointType(value);
    });

    this.selectedActivityNames = evt;
    selectedActivityNames.setValue(selectedActivityNamesIds);
    selectedCityIdForCustomsPost.setValue(this.selectedActivityNames.length > 0 ? selectedCityIdForCustomsPost.value : null);
    selectedCustomsPostId.setValue(this.selectedActivityNames.length > 0 ? selectedCustomsPostId.value : null);
    this.isProductDisabled = this.selectedActivityNames.length > 0 ? isProductDisabled : true;

    if (this.isProductDisabled) {
      products.disable();
      products.reset();
    } else {
      products.enable();
    }
  }

  /**
   * Fires an event every time category selected
   */
  onSelectedCategory(evt: Category): void {
    this.selectedCategory = evt;
    this.formGroup.get('selectedCategoryId').setValue(evt && evt.id || null);
    this._router.navigate([],
      {
        relativeTo: this._route,
        queryParams: {selectedCategory: null},
        queryParamsHandling: 'merge'
      });
  }

  /**
   * Fires an event every time start point changed
   */
  onStartPointChanged(evt: any): void {
    this._selectedLoadingRegion = evt;
    this.formGroup.get('loadingRegion').setValue(evt && evt.id || null);
  }

  /**
   * Fires an event every time finish point changed
   */
  onFinishPointChanged(evt: any): void {
    this._selectedUnloadingRegion = evt;
    this.formGroup.get('unloadingRegion').setValue(evt && evt.id || null);
  }

  /**
   * Fires an event every time statistics by companies page changed
   */
  onCompaniesStatisticsPageChanged(evt: PageEvent): void {
    this.statisticsPageIndex = evt.pageIndex;
  }

  /**
   * Fires an event every time company changed
   */
  onSelectedCompaniesChanged(evt: any): void {
    this.formGroup.get('selectedCompanies').setValue(evt);
  }

  /**
   * Fires an event every time activity changed
   */
  onSelectedActivityChanged(evt: any): void {
    this.formGroup.get('activity').setValue(evt && pick(evt, ['id', 'activityNameId']) || null);
  }

  /**
   * Fires an event every time city for searching customs post changed
   */
  onSelectedCityForCustomsPostChanged(evt: City): void {
    const selectedCityIdForCustomsPost = this.formGroup.get('selectedCityIdForCustomsPost');
    selectedCityIdForCustomsPost.setValue(evt && evt.id || null);

    if (evt) {
      this.customsPosts$ = this._statisticsAnalyticsService.getCustomsPosts(selectedCityIdForCustomsPost.value);
      this.formGroup.get('selectedCustomsPostId').enable();
    } else {
      this.formGroup.get('selectedCustomsPostId').disable();
    }
  }

  /**
   * Fires an event every time products changed
   */
  onSelectedProductsChanged(evt: any[]): void {
    const productsIds = [];

    evt.forEach(product => productsIds.push(product.id));
    this.formGroup.get('products').setValue(productsIds.length > 0 ? productsIds.join(',') : null);
  }

  /**
   * Shows received offers emails dialog
   */
  showReceivedOffersEmails(activityName: number): void {
    this._matDialog.open(EmailListComponent, {
      minWidth: '600px',
      minHeight: '400px',
      disableClose: true,
      data: {activityName}
    });
  }

  /**
   * Form group initialization
   */
  private _initFormGroup(): void {
    this.formGroup = this._formBuilder.group({
      dealTypes: null,
      orderOfferDealId: null,
      selectedActivityNames: null,
      selectedCategoryId: null,
      selectedCountryId: null,
      selectedRegion: null,
      selectedCity: null,
      selectedCityIdForCustomsPost: {value: null, disabled: true},
      selectedCustomsPostId: {value: null, disabled: true},
      selectedCompanies: null,
      dateFrom: null,
      dateTo: null,
      activity: {value: null, disabled: true},
      loadingRegion: {value: null, disabled: true},
      unloadingRegion: {value: null, disabled: true},
      products: {value: null, disabled: true},
    });
  }

  /**
   * Fires an event every time city for customs post selected
   */
  private _handleCityForCustomsPost(): void {
    this.formGroup.get('selectedCityIdForCustomsPost').valueChanges
      .pipe(
        filter(res => {
          if (!!res) {
            return true;
          } else {
            this.customsPosts$ = of([]);
          }
        }),
        takeUntil(this._unsubscribe$)
      )
      .subscribe(res => this.customsPosts$ = this._statisticsAnalyticsService.getCustomsPosts(res));
  }

  /**
   * Search params
   */
  private _prepareSearchQuery(): any {
    const formGroupValue: any = this.formGroup.value;
    const {selectedActivityNames, activity} = formGroupValue;

    return removeEmptyProperties({
      activityNameIds: selectedActivityNames || null,
      activities: activity && JSON.stringify(activity) || null,
      id: formGroupValue.orderOfferDealId || null,
      dateFrom: formGroupValue.dateFrom && moment(formGroupValue.dateFrom).locale('ru').format('YYYY-MM-DD') || null,
      dateTo: formGroupValue.dateTo && moment(formGroupValue.dateTo).locale('ru').format('YYYY-MM-DD') || null,
      category: formGroupValue.selectedCategoryId || null,
      country: formGroupValue.selectedCountryId || null,
      region: formGroupValue.selectedRegion && +formGroupValue.selectedRegion.id || null,
      city: formGroupValue.selectedCity && formGroupValue.selectedCity.id || null,
      customPort: formGroupValue.selectedCustomsPostId || null,
      loadingRegion: formGroupValue.loadingRegion || null,
      unloadingRegion: formGroupValue.unloadingRegion || null,
      products: formGroupValue.products || null,
    });
  }

  /**
   * Retrieves all statistics or by filter
   */
  private _getStatistics(): void {
    if (!this.isPending) {
      const params: any = this._prepareSearchQuery();
      this.isPending = true;
      this.statisticsLoading = true;

      this._statisticsAnalyticsService.getStatistics(params)
        .pipe(takeUntil(this._unsubscribe$))
        .subscribe((res: any) => {
          this.statisticsLoading = false;
          this.isPending = false;
          this.statistics = res;

          if (params && Object.keys(params).length > 0) {
            this.totalCompanies = res.filteredCountOfCompanies;
          } else {
            this.totalCompanies = res.totalCountOfCompanies;
          }
        }, () => {
          this.statisticsLoading = false;
          this.isPending = false;
        });
    }
  }

  /**
   * Retrieves geo statistics
   */
  private _getGeoStatistics(): void {
    this._locationService.getCountries()
      .pipe(
        tap(() => this.geoStatisticsLoading = true),
        switchMap((res: Country[]) => {
          this.countries = res;
          return this._statisticsAnalyticsService.getGeoStatistics();
        })
      )
      .subscribe(res => {
        this.geoStatisticsLoading = false;
        this.geoStatistics = res;
      }, () => this.geoStatisticsLoading = false);
  }

  /**
   * Retrieves companies' statistics
   */
  private _getCompaniesStatistics(): void {
    if (!this.isPending) {
      const params: any = this._prepareSearchQuery();
      const selectedCompanies: any[] = this.formGroup.get('selectedCompanies').value;
      const companyIds: number[] = [];

      this.isPending = true;
      this.statisticsLoading = true;

      if (selectedCompanies) {
        selectedCompanies.forEach((company: any) => companyIds.push(company.id));
      }

      params.companies = JSON.stringify(companyIds);

      if (companyIds.length > 0) {
        this._statisticsAnalyticsService.getCompaniesStatistics(params)
          .pipe(takeUntil(this._unsubscribe$))
          .subscribe(res => {
            this.isPending = false;
            this.statisticsLoading = false;
            this.statistics = res;
          }, () => {
            this.statisticsLoading = false;
            this.isPending = false;
          });
      }
    }
  }

  /**
   * Sets point types for searching activity name companies
   */
  private _setPointType(activityName: ActivityNameModel): void {
    switch (activityName.id) {
      case ActivityNames.InternationalRoadHauler:
      case ActivityNames.DomesticRoadHauler: {
        this.pointType = 'region';
        break;
      }
      case ActivityNames.InternationalRailCarriers:
      case ActivityNames.DomesticRailCarriers: {
        this.pointType = 'station';
        break;
      }
      case ActivityNames.InternationalAirCarriers:
      case ActivityNames.DomesticAirCarriers: {
        this.pointType = 'airport';
        break;
      }
      case ActivityNames.SeaLines: {
        this.pointType = 'sea';
        break;
      }
      case ActivityNames.RiverLines: {
        this.pointType = 'river';
        break;
      }
      default: {
        this.pointType = 'region';
        break;
      }
    }
  }

  private _handleFormGroup(): void {
    this.formGroup.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this._unsubscribe$)
      )
      .subscribe(() => this._navigateWithQueryParams());
  }

  /**
   * Navigates with query params due to form group changes
   */
  private _navigateWithQueryParams(): void {
    const {
      selectedActivityNames,
      selectedRegion,
      selectedCity,
      selectedCityIdForCustomsPost,
      selectedCompanies,
      products,
      dateFrom, dateTo, orderOfferDealId, selectedCategoryId, selectedCountryId, selectedCustomsPostId, loadingRegion, unloadingRegion
    } = this.formGroup.value;
    const dataForQueryParams: any = {};
    dataForQueryParams.orderOfferDealId = orderOfferDealId;
    dataForQueryParams.selectedCategoryId = selectedCategoryId;
    dataForQueryParams.selectedCountryId = selectedCountryId;
    dataForQueryParams.selectedCityIdForCustomsPost = selectedCityIdForCustomsPost;
    dataForQueryParams.selectedCustomsPostId = selectedCustomsPostId;
    dataForQueryParams.selectedRegionName = selectedRegion && selectedRegion.nameRu || null;
    dataForQueryParams.selectedCityName = selectedCity && selectedCity.nameRu || null;

    if (selectedActivityNames && typeof selectedActivityNames !== 'string' && selectedActivityNames.length > 0) {
      dataForQueryParams.selectedActivityNames = JSON.stringify(selectedActivityNames);
    } else {
      dataForQueryParams.selectedActivityNames = selectedActivityNames;
    }

    if (selectedCompanies && selectedCompanies.length > 0) {
      const selectedCompaniesIds: number[] = [];
      for (let i = 0; i < selectedCompanies.length; i++) {
        const selectedCompanyId = selectedCompanies[i].id;
        selectedCompaniesIds.push(selectedCompanyId);
      }
      dataForQueryParams.selectedCompaniesIds = JSON.stringify(selectedCompaniesIds);
    } else {
      dataForQueryParams.selectedCompaniesIds = null;
    }

    if (products) {
      const productsArr: number[] = (products as string).split(',').map(product => +product);
      dataForQueryParams.products = JSON.stringify(productsArr);
    } else {
      dataForQueryParams.products = null;
    }

    if (dateFrom) {
      dataForQueryParams.dateFrom = moment(dateFrom).format('YYYY-MM-DD');
    }

    if (dateTo) {
      dataForQueryParams.dateTo = moment(dateTo).format('YYYY-MM-DD');
    }

    if (loadingRegion) {
      dataForQueryParams.loadingRegion = loadingRegion;
      dataForQueryParams.loadingRegionName = this._selectedLoadingRegion && this._selectedLoadingRegion.name
        || this.selectedLoadingRegion && this.selectedLoadingRegion.name || null;
    } else {
      dataForQueryParams.loadingRegion = null;
      dataForQueryParams.loadingRegionName = null;
    }

    if (unloadingRegion) {
      dataForQueryParams.unloadingRegion = unloadingRegion;
      dataForQueryParams.unloadingRegionName = this._selectedUnloadingRegion && this._selectedUnloadingRegion.name
        || this.selectedUnloadingRegion && this.selectedUnloadingRegion.name || null;
    } else {
      dataForQueryParams.unloadingRegion = null;
      dataForQueryParams.unloadingRegionName = null;
    }

    this._router.navigate([],
      {
        relativeTo: this._route,
        queryParams: dataForQueryParams,
        queryParamsHandling: 'merge'
      });
  }

  /**
   * Patches query params data to form group on init
   */
  private _patchQueryParams(): void {
    const queryParams = {...this._queryParams};

    if (queryParams.selectedCountryId) {
      this.selectedCountries = +queryParams.selectedCountryId;
    }

    if (queryParams.selectedActivityNames) {
      this.selectedActivityName = JSON.parse(queryParams.selectedActivityNames);
      this.isSelectCityForCustomsPostDisabled = false;
      this.isActivityDisabled = false;

      this.isProductDisabled = this.selectedActivityName.some(value => {
        return value !== ActivityNames.Supplier && value !== ActivityNames.ProducerFactory;
      });

      this.isRoutePointDisabled = this.selectedActivityName.some(value => {
        return value === ActivityNames.Supplier || value === ActivityNames.ProducerFactory;
      });

      this.isSelectCityForCustomsPostDisabled = this.selectedActivityName.some(value => {
        return value !== ActivityNames.CustomsRepresentativeWithoutLicense && value !== ActivityNames.CustomsRepresentativeWithLicense;
      });

      if (!this.isSelectCityForCustomsPostDisabled) {
        this.formGroup.get('selectedCityIdForCustomsPost').enable();
      }

      this.formGroup.get('products').enable();
      this.formGroup.get('activity').enable();

      if (!this.isRoutePointDisabled) {
        this.formGroup.get('loadingRegion').enable();
        this.formGroup.get('unloadingRegion').enable();
      }
    }

    if (queryParams.selectedCompaniesIds) {
      this.selectedCompaniesIds = JSON.parse(queryParams.selectedCompaniesIds);
    }

    if (queryParams.products) {
      this.selectedProductsIds = JSON.parse(queryParams.products);
      queryParams.products = this.selectedProductsIds.join(',');
    }

    if (queryParams.dateFrom && moment(queryParams.dateFrom, 'YYYY-MM-DD', true).isValid()) {
      queryParams.dateFrom = new Date(queryParams.dateFrom);
    }

    if (queryParams.dateTo && moment(queryParams.dateTo, 'YYYY-MM-DD', true).isValid()) {
      queryParams.dateTo = new Date(queryParams.dateTo);
    }

    if (queryParams.selectedCityIdForCustomsPost) {
      this.selectedCityIdForCustomsPost = +queryParams.selectedCityIdForCustomsPost;
      this.formGroup.get('selectedCustomsPostId').enable();
    }

    if (queryParams.loadingRegion) {
      queryParams.loadingRegion = +queryParams.loadingRegion;
      this.selectedLoadingRegion.id = queryParams.loadingRegion;
      this.formGroup.get('loadingRegion').enable();
    }

    if (queryParams.loadingRegionName) {
      this.selectedLoadingRegion.name = queryParams.loadingRegionName;
    }

    if (queryParams.unloadingRegion) {
      queryParams.unloadingRegion = +queryParams.unloadingRegion;
      this.selectedUnloadingRegion.id = queryParams.unloadingRegion;
      this.formGroup.get('unloadingRegion').enable();
    }

    if (queryParams.unloadingRegionName) {
      this.selectedUnloadingRegion.name = queryParams.unloadingRegionName;
    }

    queryParams.selectedCustomsPostId = +queryParams.selectedCustomsPostId || null;
    this.selectedCategoryId = +queryParams.selectedCategoryId || null;
    this.selectedRegionName = queryParams.selectedRegionName;
    this.selectedCityName = queryParams.selectedCityName;
    this.formGroup.patchValue(queryParams);
  }

}
