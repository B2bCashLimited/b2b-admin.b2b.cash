import { Component, OnDestroy, OnInit } from '@angular/core';
import { Unit } from '@b2b/models';
import { Location } from '@angular/common';
import { Observable, Subscription, forkJoin, of } from 'rxjs';
import { MatDialog, PageEvent } from '@angular/material';
import { ActivatedRoute, Params } from '@angular/router';
import { UnitsService } from '@b2b/services/units.service';
import { ActivityNameService } from '@b2b/services/activity-name.service';
import { DeliveryTypesService } from '@b2b/services/delivery-types.service';
import { BillingService } from '@b2b/services/billing.service';
import { TreeComponent } from '@b2b/shared/modules';
import { filter, map, switchMap } from 'rxjs/operators';
import { clearSubscription } from '@b2b/decorators';
import { Actions, ActivityNames, ActivityIcons } from '@b2b/enums';

@Component({
  selector: 'b2b-coefficient',
  templateUrl: './coefficient.component.html',
  styleUrls: ['./coefficient.component.scss']
})
export class CoefficientComponent implements OnDestroy, OnInit {

  activityName: any;
  deliveryTypes: any[];
  currencies: Unit[];
  coefficients: any[];
  baseTariff: any;
  pageCount = 0;
  pageSize = 0;
  length = 0;
  isCustomsBrokers = false;
  isBuyer = false;
  serviceType: 1 | 2;
  typeName: string;

  private _paramsSub: Subscription;
  private _currentPage = 1;
  private _sub: Subscription;
  private _tariff: any;
  private _tariffId: any;

  constructor(
    private _location: Location,
    private _dialog: MatDialog,
    private _route: ActivatedRoute,
    private _unitsService: UnitsService,
    private _activityNameService: ActivityNameService,
    private _deliveryTypesService: DeliveryTypesService,
    private _billingService: BillingService) {
    this._handleRouterParams();
  }

  ngOnDestroy(): void {
    // @ClearSubscriptions()
  }

  ngOnInit(): void {
    this._unitsService.getUnitsByControlUnitType()
      .subscribe((res: any) => {
        this.currencies = res.monetary;
      });

    this._deliveryTypesService.getDeliveryTypes()
      .subscribe((res) => this.deliveryTypes = res.filter(item => !item.isModular && item.keyName !== 'multimodal'));
  }

  onAddCategoryClick() {
    this._dialog.open(TreeComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: {
        multiple: false
      }
    }).afterClosed()
      .pipe(
        filter((category) => !!category),
        switchMap((category) => {
          const body = {
            activityName: this.activityName.id,
            category: category.id,
            coefficient: 0,
            currency: this.baseTariff && this.baseTariff.currency,
            isFixed: 0,
            isPrepayment: 0,
            serviceType: this.serviceType || null,
            priceExtra: 0,
            tariff: this.baseTariff && this.baseTariff.id,
          };

          if (this._tariff) {
            body['country'] = this._tariff.country;
            body['locality'] = this._tariff.locality;
            body['region'] = this._tariff.region;

            return this._billingService.createTariff(body);
          }

          return this._billingService.createTariffRoute(body);
        }),
        switchMap((res) => {
          if (this._tariffId) {
            return this._getTariffCoefficients(1);
          }
          this.coefficients.push(res);
          return of(null);
        })
      ).subscribe();
  }

  getPage(pageEvent: PageEvent): void {
    const pageIndex = pageEvent.pageIndex + 1;
    this._currentPage = pageIndex <= this.pageCount ? Math.min(pageIndex, this.pageCount) : 1;
    clearSubscription(this._sub);
    this._sub = this._getTariffCoefficients(this._currentPage).subscribe();
  }

  private _getTariffCoefficients(page = 1): Observable<any> {
    const query = {
      activityName: this.activityName.id,
      isCoefficient: true,
      page: page
    };

    if (this._tariffId) {
      const { country, region, locality } = this._tariff;
      query['country'] = country;
      query['region'] = region;
      query['locality'] = locality;
    }

    return this._billingService.getTariffs(query)
      .pipe(
        map((res: any) => {
          this.pageSize = res.pageSize;
          this.pageCount = res.pageCount;
          this.length = res.totalItems;
          this.coefficients = res.tariffs;
        })
      );
  }

  goBack() {
    this._location.back();
  }

  onChangeItem({ action, payload }) {
    switch (action) {
      case Actions.DELETE_TARIFF:
        this.deleteTariff(+payload.id);
        break;
    }
  }

  deleteTariff(id: number) {
    if (this.isCustomsBrokers) {
      this._billingService.deleteTariffRoute(id).subscribe(() => {
        this.coefficients = this.coefficients.filter((item) => +item.id !== id);
      });
    } else {
      this._billingService.deleteTariff(id).subscribe(() => {
        this.coefficients = this.coefficients.filter((item) => +item.id !== id);
      });
    }
  }

  getTypeName(type) {
    switch (+type) {
      case 1:
        return 'Таможенная очистка';
      case 2:
        return 'Таможенные перевозки';
      default:
        return 'Товары по категориям';
    }
  }

  /**
   * Handle activated route params and retrieve activity name by id
   */
  private _handleRouterParams(): void {
    this._tariffId = this._route.snapshot.queryParams.tariff;
    this.serviceType = this._route.snapshot.queryParams.service;

    this.typeName = this.getTypeName(this._route.snapshot.queryParams.service);
    this._paramsSub = this._route.params
      .pipe(
        filter((params: Params) => params && !!(+params.activityNameId)),
        switchMap((params: Params) => {
          this.isCustomsBrokers = [
            ActivityNames.CustomsRepresentativeWithoutLicense,
            ActivityNames.CustomsRepresentativeWithLicense
          ].includes(+params.activityNameId) || (+params.activityNameId === ActivityNames.Buyer && this.serviceType === 2);

          if (this._tariffId) {
            return this.getProductTariffs(this._tariffId, params.activityNameId);
          }

          return this.getCustomTariffs(params.activityNameId);
        }),
      ).subscribe();
  }

  getProductTariffs(tariffId: number, activityNameId: number): Observable<any> {
    return forkJoin(
      this._billingService.getTariff(tariffId),
      this._activityNameService.getActivityNameById(activityNameId),
      this._billingService.getBaseTariffs({ notCountry: true, activityName: activityNameId }))
      .pipe(
        switchMap(([tariff, activityName, tariffBases]) => {
          this._tariff = tariff;
          this.activityName = activityName;
          this.isBuyer = +this.activityName.id === ActivityNames.Buyer;
          if (this.isBuyer) {
            this.activityName.icon = ActivityIcons.bayer;
          }
          this.baseTariff = tariffBases.tariffBases[0];
          return this._getTariffCoefficients(1);
        }),
      );
  }

  getCustomTariffs(activityNameId: number): Observable<any> {
    const query = {
      activityName: activityNameId,
      hasDelivery: false,
      isCoefficient: true
    };
    if (this.serviceType) {
      query['serviceType'] = this.serviceType;
    }
    return forkJoin(
      this._billingService.getTariffRoutes(query),
      this._activityNameService.getActivityNameById(activityNameId),
      this._billingService.getBaseTariffs({ notCountry: true, activityName: activityNameId }))
      .pipe(
        map(([tariff, activityName, tariffBases]) => {
          this.activityName = activityName;
          this.isBuyer = +this.activityName.id === ActivityNames.Buyer;
          if (this.isBuyer) {
            this.activityName.icon = ActivityIcons.bayer;
          }
          this.baseTariff = tariffBases.tariffBases[0];

          this.pageSize = tariff.pageSize;
          this.pageCount = tariff.pageCount;
          this.length = tariff.totalItems;
          this.coefficients = tariff.tariffRoutes;
        }),
      );
  }
}
