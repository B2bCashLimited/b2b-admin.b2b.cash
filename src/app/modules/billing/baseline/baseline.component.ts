import {Component, OnDestroy, OnInit} from '@angular/core';
import {forkJoin, Observable, Subscription} from 'rxjs';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {Location} from '@angular/common';
import {LocationService} from '@b2b/services/location.service';
import {UnitsService} from '@b2b/services/units.service';
import {ActivatedRoute, Params} from '@angular/router';
import {ActivityNameService} from '@b2b/services/activity-name.service';
import {BillingService} from '@b2b/services/billing.service';
import {MatDialog} from '@angular/material';
import { filter, first, switchMap, tap } from 'rxjs/operators';
import {clearSubscription, ClearSubscriptions} from '@b2b/decorators';
import {PlanSettingsComponent} from './dialogs/plan-settings/plan-settings.component';
import {ActivityNames, ActivityIcons} from '@b2b/enums';
import {LocationDialogComponent} from './dialogs/location-dialog/location-dialog.component';
import {GlobalErrorDialogComponent} from '@b2b/shared/dialogs/global-error-dialog/global-error-dialog.component';
import { OrderPriceDialogComponent } from '@b2b/shared/dialogs';

interface Tariff {
  activityName?: number;
  category?: number;
  coefficient: number;
  country?: number;
  currency?: number;
  isFixed: boolean;
  isPrepayment: boolean;
  locality?: number;
  priceExtra?: number;
  region?: number;
  tariff: number;
}

class TariffNode {
  activityName: number;
  category: number;
  children: TariffNode[];
  coefficient: number;
  country: number;
  currency: number | any;
  hasCoefficient: boolean;
  id: number;
  isFixed: boolean;
  isPrepayment: boolean;
  locality: number;
  nameCn: string;
  nameEn: string;
  nameRu: string;
  priceExtra: number;
  region: number;
  rates: any[];
  tariff: number;
}

@ClearSubscriptions()
@Component({
  selector: 'b2b-baseline',
  templateUrl: './baseline.component.html',
  styleUrls: ['./baseline.component.scss']
})
export class BaselineComponent implements OnDestroy, OnInit {
  countries$: Observable<any>;
  activityName: any;
  currencies: any;
  loading = true;
  baseTariff: any;
  tariffs: any;
  formGroup: FormGroup;
  isBayer = false;
  isProduct = false;
  isEdit = false;
  isOrderPrice = false;

  private _paramsSub: Subscription;
  private _baseSub: Subscription;

  constructor(
    private _location: Location,
    private _locationService: LocationService,
    private _unitsService: UnitsService,
    private _route: ActivatedRoute,
    private _activityService: ActivityNameService,
    private _billingService: BillingService,
    private _formBuilder: FormBuilder,
    private _matDialog: MatDialog) {
    this.handleRouterParams();
  }

  ngOnDestroy(): void {
    // @ClearSubscriptions()
  }

  ngOnInit(): void {
    /*this._billingService.createTariff({
      isPrepayment: 1,
      isFixed: 0,
      coefficient: 0,
      tariff: 1,
      activityName: 1,
      country: 405,
      region: 2204,
      locality: 1243243,
      category: 3218,
      currency: 27,
    }).subscribe(console.log);*/
    this.isOrderPrice = this._route.snapshot.queryParams.isOrderPrice;
    this.formGroup = this._formBuilder.group({
      price: [{value: null, disabled: true}, [Validators.required]],
      currency: [{value: null, disabled: true}, [Validators.required]],
      activityName: [null, [Validators.required]],
    });

    this.countries$ = this._locationService.getCountries()
      .pipe(tap(() => this.loading = false));

    this._unitsService.getUnitsByControlUnitType()
      .subscribe((res: any) => {
        this.currencies = res.monetary;
      });
  }

  goBack() {
    this._location.back();
  }

  onAddCountryClick(): void {
    this._matDialog.open(LocationDialogComponent, {
      width: '500px',
      maxHeight: '90vh',
      disableClose: true,
      data: {
        type: 'country',
      }
    }).afterClosed()
      .pipe(
        filter((apply) => !!apply),
        switchMap((country: number) => {
          return this._billingService.createTariff({
            isPrepayment: 1,
            isFixed: 1,
            coefficient: 0,
            priceExtra: 0,
            isClient: this.isBayer,
            tariff: this.baseTariff.id,
            activityName: this.activityName.id,
            currency: this.baseTariff.currency,
            country,
          });
        })
      )
      .subscribe((res) => {
        this.tariffs = [...this.tariffs, ...getBaseTariffs([res])];
      }, () => {
        this._matDialog.open(GlobalErrorDialogComponent, {
          data: {
            errorData: {
              title: 'Вы не можете добавить страну, она уже существует.'
            }
          }
        });
      });
  }

  onAddBaseRouteClick(): void {
    if (this.isEdit) {
      const body = {
        ...this.formGroup.value,
        isClient: this.isBayer
      };
      let serviceQuery: Observable<any>;
      if (this.baseTariff) {
        serviceQuery = this._billingService.updateTariffBase(this.baseTariff.id, body);
      } else {
        serviceQuery = this._billingService.createBaseTariff(body);
      }

      serviceQuery.subscribe((res) => {
          this.baseTariff = res;
          this.formGroup.get('price').patchValue(this.baseTariff.price);
          this.formGroup.get('currency').patchValue(+this.baseTariff.currency.id);
          this.formGroup.get('activityName').patchValue(+this.baseTariff.activityName.id);
          this.formGroup.get('price').disable();
          this.formGroup.get('currency').disable();
          this.isEdit = false;
        });
    } else {
      this.formGroup.get('price').enable();
      this.formGroup.get('currency').enable();
      this.isEdit = true;
    }
  }

  onAddLocationClick(evt: MouseEvent, node: TariffNode): void {
    evt.stopPropagation();
    this._matDialog.open(LocationDialogComponent, {
      width: '500px',
      maxHeight: '90vh',
      disableClose: true,
      data: {
        type: node.region ? 'locality' : 'region',
        node,
      }
    }).afterClosed()
      .pipe(
        filter((apply) => !!apply),
        switchMap((id: number) => {
          return this._billingService.createTariff({
            isPrepayment: 1,
            isFixed: 0,
            coefficient: 0,
            tariff: this.baseTariff.id,
            activityName: this.activityName.id,
            country: node.country,
            currency: node.currency && node.currency.id,
            region: node.region || id,
            locality: node.region ? id : null,
          });
        })
      ).subscribe((res) => {
        if (res) {
          const children = node.region ? getRegionTariffs([res]) : getCountryTariffs([res]);
          node.children.push(...children);
        }
      }, () => {
        this._matDialog.open(GlobalErrorDialogComponent, {
          data: {
            errorData: {
              title: `${node.region ? 'Населенный пункт' : 'Регион'} уже существует. Вы не можете добавить ещё одну.`
            }
          }
        });
      });
  }

  onCountryTariffExpanded(node: TariffNode): void {
    if (!node.children || !node.children.length) {
      const params = {
        activityName: node.activityName,
        country: node.country,
      };
      clearSubscription(this._baseSub);
      this._baseSub = this._billingService.getTariffs(params)
        .subscribe((res: any) => node.children = getCountryTariffs(res.tariffs));
    }
  }

  onChildTariffExpanded(node: TariffNode): void {
    if (!node.children || !node.children.length) {
      const params = {
        activityName: node.activityName,
        country: node.country,
        region: node.region,
      };
      clearSubscription(this._baseSub);
      this._baseSub = this._billingService.getTariffs(params)
        .subscribe((res) => node.children = getRegionTariffs(res.tariffs));
    }
  }

  onEditNodeClick(evt: MouseEvent, node: TariffNode, base: TariffNode): void {
    evt.stopPropagation();
    this._matDialog.open(PlanSettingsComponent, {
      maxWidth: '500px',
      maxHeight: '90vh',
      disableClose: true,
      data: { node, currencies: this.currencies }
    }).afterClosed()
      .pipe(
        filter(apply => !!apply),
        switchMap(data => {
          const body = {
            activityName: base.activityName,
            tariff: base.id,
            isPrepayment: data.isPrepayment ? 1 : 0,
            isFixed: data.isFixed ? 1 : 0,
            coefficient: data.coefficient,
            priceExtra: data.priceExtra,
            category: data.category,
            country: data.country,
            region: data.region,
            locality: data.locality,
            currency: data.currency,
          };
          return this._billingService.updateTariff(node.id, body);
        })
      ).subscribe(({coefficient, priceExtra, isFixed, _embedded: {currency}}) => {
        node.coefficient = coefficient;
        node.priceExtra = priceExtra;
        node.isFixed = isFixed;
        node.currency = currency;
      });
  }

  onDeleteNodeClick(evt: MouseEvent, node: TariffNode): void {
    evt.stopPropagation();
    this._billingService.deleteTariff(node.id)
      .subscribe(() => {
        if (!(node.region || node.locality)) {
          this.tariffs = this.tariffs.filter(item => item.id !== node.id);
        } else {
          if (node.hasOwnProperty('locality')) {
            for (const base of this.tariffs) {
              for (const child of base.children) {
                child.children = child.children.filter(item => item.id !== node.id);
              }
            }
          } else {
            for (const base of this.tariffs) {
              base.children = (base.children || []).filter(child => child.id !== node.id);
            }
          }
        }
      });
  }

  showOrderPriceDialog(evt: any, node: TariffNode): void {
    if (evt) {
      evt.stopPropagation();
    }

    this._matDialog.open(OrderPriceDialogComponent, {
      data: {node}
    })
      .afterClosed()
      .pipe(
        first(),
        filter((res: any) => !!res),
        switchMap((res: any) => {
          const body = {
            activityName: node.activityName,
            tariff: node.id,
            isPrepayment: node.isPrepayment ? 1 : 0,
            isFixed: node.isFixed ? 1 : 0,
            coefficient: node.coefficient,
            priceExtra: node.priceExtra,
            currency: res.currency,
            rates: res.rates
          };
          return this._billingService.updateTariff(node.id, body);
        })
      )
      .subscribe(({coefficient, priceExtra, isFixed, rates, _embedded: {currency}}) => {
        node.coefficient = coefficient;
        node.priceExtra = priceExtra;
        node.isFixed = isFixed;
        node.currency = currency;
        node.rates = rates;
      });
  }

  /**
   * Handle activated route params and retrieve activity name by id
   */
  private handleRouterParams(): void {
    this._paramsSub = this._route.params
      .pipe(
        filter((params: Params) => params && !!(+params.activityNameId)),
        switchMap((params: Params) => {
          return forkJoin(
            this._billingService.getBaseTariffs({activityName: params.activityNameId}),
            this._activityService.getActivityNameById(params.activityNameId)
          );
        }),
        switchMap((res: any) => {
          if (res[0].tariffBases && res[0].tariffBases.length) {
            this.baseTariff = res[0].tariffBases.shift(); // TODO refactor this
            this.formGroup.get('price').patchValue(this.baseTariff.price);
            this.formGroup.get('currency').patchValue(+this.baseTariff.currency);
          }
          this.activityName = res[1];
          if (this.activityName.id === ActivityNames.Buyer) {
            this.activityName.icon = ActivityIcons.bayer;
          }
          this.formGroup.get('activityName').patchValue(+this.activityName.id);
          return this._billingService.getTariffs({isCountry: true, activityName: this.activityName.id });
        })
      ).subscribe((res) => {
        this.isBayer = this.activityName && this.activityName.id === ActivityNames.Buyer;
        this.isProduct = this.activityName &&
         (this.activityName.id === ActivityNames.Supplier || this.activityName.id === ActivityNames.ProducerFactory);
        this.tariffs = getBaseTariffs(res.tariffs);
      });
  }
}


function getBaseTariffs(tariffs: any[]) {
  return tariffs.map(tariff => {
    const node = new TariffNode();
    node.activityName = tariff.activityName.id;
    node.children = [];
    node.coefficient = tariff.coefficient;
    node.country = tariff.country && tariff.country.id;
    node.currency = tariff.currency;
    node.hasCoefficient = tariff.hasCoefficient;
    node.id = tariff.id;
    node.isFixed = tariff.isFixed;
    node.isPrepayment = tariff.isPrepayment;
    node.nameCn = tariff.country && tariff.country.nameCn;
    node.nameEn = tariff.country && tariff.country.nameEn;
    node.nameRu = tariff.country && tariff.country.nameRu;
    node.priceExtra = tariff.priceExtra;
    node.rates = tariff.rates;
    node.tariff = tariff.tariff;
    return node;
  });
}

function getCountryTariffs(tariffs: any[]) {
  return tariffs.map(tariff => {
    const node = new TariffNode();
    node.activityName = tariff.activityName.id;
    node.children = [];
    node.coefficient = tariff.coefficient;
    node.country = tariff.country.id;
    node.currency = tariff.currency;
    node.hasCoefficient = tariff.hasCoefficient;
    node.id = tariff.id;
    node.isFixed = tariff.isFixed;
    node.isPrepayment = tariff.isPrepayment;
    node.nameCn = tariff.region && tariff.region.nameCn;
    node.nameEn = tariff.region && tariff.region.nameEn;
    node.nameRu = tariff.region && tariff.region.nameRu;
    node.priceExtra = tariff.priceExtra;
    node.region = tariff.region && tariff.region.id;
    node.rates = tariff.rates;
    node.tariff = tariff.tariff;
    return node;
  });
}


function getRegionTariffs(tariffs: any[]) {
  return tariffs.map(tariff => {
    const node = new TariffNode();
    node.activityName = tariff.activityName.id;
    node.children = [];
    node.coefficient = tariff.coefficient;
    node.country = tariff.country.id;
    node.currency = tariff.currency;
    node.hasCoefficient = tariff.hasCoefficient;
    node.id = tariff.id;
    node.isFixed = tariff.isFixed;
    node.isPrepayment = tariff.isPrepayment;
    node.locality = tariff.locality.id;
    node.nameCn = tariff.locality.nameCn;
    node.nameEn = tariff.locality.nameEn;
    node.nameRu = tariff.locality.nameRu;
    node.priceExtra = tariff.priceExtra;
    node.region = tariff.region.id;
    node.rates = tariff.rates;
    node.tariff = tariff.tariff;
    return node;
  });
}
