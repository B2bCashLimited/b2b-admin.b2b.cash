import { BillingService } from '@b2b/services/billing.service';
import { Unit } from '@b2b/models';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { getFieldValue, patchFieldValue } from '@b2b/utils';
import { Actions } from '@b2b/enums';
import { MatDialog } from '@angular/material';
import { OrderPriceDialogComponent } from '@b2b/shared/dialogs';
import { filter, first } from 'rxjs/operators';

const STATIONS = {
  default: {
    icon: 'icon-home',
    placeholder: '',
    type: ''
  },
  sea: {
    icon: 'icon-ship',
    placeholder: 'Порт',
    type: 'sea'
  },
  plane: {
    icon: 'icon-plane',
    placeholder: 'Аэропорт',
    type: 'air'
  },
  train: {
    icon: 'icon-train',
    placeholder: 'Станция',
    type: 'rail'
  }
};

const TRANSPORTS = ['train', 'sea', 'plane'];

@Component({
  selector: 'b2b-customs-route',
  templateUrl: './customs-route.component.html',
  styleUrls: ['./customs-route.component.scss']
})
export class CustomsRouteComponent implements OnInit {

  e_STATIONS = STATIONS;

  @Input() deliveryTypes: any[];
  @Input() item: any;
  @Input() baseTariff: any;
  @Input() category: any;
  @Input() isPrepayment = 0;
  @Input() currencies: Unit[];

  @Output() itemOnChanged = new EventEmitter<{ action: string, payload: any }>();

  formGroup: FormGroup;

  keyName: string;
  deliveryLoadIcon: string;
  deliveryUnloadIcon: string;
  loadStation: any;
  unloadStation: any;
  deliveryLoad = false;
  deliveryUnload = false;
  isEdit = true;

  constructor(
    private _fb: FormBuilder,
    private _billingService: BillingService,
    private _matDialog: MatDialog
  ) {
  }

  ngOnInit() {
    this.createForm();

    this.formGroup.get('deliveryType').valueChanges.subscribe((value: number) => {
      if (value) {
        const deliveryType = this.deliveryTypes.find(dt => dt.id === value);
        this.keyName = deliveryType.keyName;
        if (this.item && TRANSPORTS.includes(this.keyName)) {
          this.deliveryLoadIcon = STATIONS[(this.loadStation ? this.keyName : 'default')].icon;
          this.deliveryUnloadIcon = STATIONS[(this.unloadStation ? this.keyName : 'default')].icon;
        } else {
          this.deliveryLoad = false;
          this.deliveryUnload = false;
          this.deliveryLoadIcon = STATIONS.default.icon;
          this.deliveryUnloadIcon = STATIONS.default.icon;
        }
      }
    });
  }

  createForm() {
    if (this.item) {
      this.keyName = this.item.deliveryType && this.item.deliveryType.keyName;
      this.deliveryLoadIcon = STATIONS.default.icon;
      this.deliveryUnloadIcon = STATIONS.default.icon;
      this.isEdit = false;

      if (TRANSPORTS.includes(this.keyName)) {
        if (this.item.loadingAirport) {
          this.deliveryLoad = true;
          this.loadStation = this.item.loadingAirport;
          this.deliveryLoadIcon = STATIONS['plane'].icon;
        }
        if (this.item.unloadingAirport) {
          this.deliveryUnload = true;
          this.unloadStation = this.item.unloadingAirport;
          this.deliveryUnloadIcon = STATIONS['plane'].icon;
        }
        if (this.item.loadingRiverport || this.item.loadingSeaport) {
          this.deliveryLoad = true;
          this.loadStation = this.item.loadingRiverport || this.item.loadingSeaport;
          this.deliveryLoadIcon = STATIONS['sea'].icon;
        }
        if (this.item.unloadingRiverport || this.item.unloadingSeaport) {
          this.deliveryUnload = true;
          this.unloadStation = this.item.unloadingRiverport || this.item.unloadingSeaport;
          this.deliveryUnloadIcon = STATIONS['sea'].icon;
        }
        if (this.item.loadingStation) {
          this.deliveryLoad = true;
          this.loadStation = this.item.loadingStation;
          this.deliveryLoadIcon = STATIONS['train'].icon;
        }
        if (this.item.unloadingStation) {
          this.deliveryUnload = true;
          this.unloadStation = this.item.unloadingStation;
          this.deliveryUnloadIcon = STATIONS['train'].icon;
        }
      }
    }

    this.formGroup = this._fb.group({
      coefficient: { value: this.item && this.item.coefficient || null, disabled: !this.isEdit },
      priceExtra: { value: this.item && this.item.priceExtra || null, disabled: !this.isEdit },
      isFixed: { value: this.item && this.item.isFixed || false, disabled: !this.isEdit },
      isPrepayment: this.isPrepayment || 0,
      rates: this.item && this.item.rates || [],
      serviceType: null,

      currency: { value: this.item && this.item.currency && this.item.currency.id || null, disabled: !this.isEdit },
      deliveryType: [{
        value: this.item && this.item.deliveryType && this.item.deliveryType.id || null,
        disabled: !this.isEdit
      }, Validators.required],
      // loadingFrom
      countryFrom: [this.item && this.item.countryFrom && this.item.countryFrom.id || null, Validators.required],
      regionFrom: this.item && this.item.regionFrom && this.item.regionFrom.id || null,
      localityFrom: this.item && this.item.localityFrom && this.item.localityFrom.id || null,
      loadingRiverport: this.item && this.item.loadingRiverport && this.item.loadingRiverport.id || null,
      loadingSeaport: this.item && this.item.loadingSeaport && this.item.loadingSeaport.id || null,
      loadingAirport: this.item && this.item.loadingAirport && this.item.loadingAirport.id || null,
      loadingStation: this.item && this.item.loadingStation && this.item.loadingStation.id || null,
      // unloadingTo
      countryTo: [this.item && this.item.countryTo && this.item.countryTo.id || null, Validators.required],
      regionTo: this.item && this.item.regionTo && this.item.regionTo.id || null,
      localityTo: this.item && this.item.localityTo && this.item.localityTo.id || null,
      unloadingRiverport: this.item && this.item.unloadingRiverport && this.item.unloadingRiverport.id || null,
      unloadingSeaport: this.item && this.item.unloadingSeaport && this.item.unloadingSeaport.id || null,
      unloadingAirport: this.item && this.item.unloadingAirport && this.item.unloadingAirport.id || null,
      unloadingStation: this.item && this.item.unloadingStation && this.item.unloadingStation.id || null
    });
  }

  onChangePriceTypeClick() {
    if (this.formGroup.get('isFixed').value) {
      this.formGroup.get('isFixed').patchValue(false);
      this.formGroup.get('priceExtra').patchValue(this.item && this.item.priceExtra);
    } else {
      this.formGroup.get('isFixed').patchValue(true);
      this.formGroup.get('coefficient').patchValue(this.item && this.item.coefficient);
    }
  }

  onChangeIconClick(loading: boolean): void {
    if (this.isEdit) {
      if (loading) {
        this.formGroup.get('countryFrom').reset();
        this.formGroup.get('regionFrom').reset();
        this.formGroup.get('localityFrom').reset();
        this.formGroup.get('loadingRiverport').reset();
        this.formGroup.get('loadingSeaport').reset();
        this.formGroup.get('loadingAirport').reset();
        this.formGroup.get('loadingStation').reset();
        if (this.formGroup.get('deliveryType').value && TRANSPORTS.includes(this.keyName)) {
          this.deliveryLoad = !this.deliveryLoad;
          this.deliveryLoadIcon = STATIONS[(this.deliveryLoad ? this.keyName : 'default')].icon;
        }
      } else {
        this.formGroup.get('countryTo').reset();
        this.formGroup.get('regionTo').reset();
        this.formGroup.get('localityTo').reset();
        this.formGroup.get('unloadingRiverport').reset();
        this.formGroup.get('unloadingSeaport').reset();
        this.formGroup.get('unloadingAirport').reset();
        this.formGroup.get('unloadingStation').reset();
        if (this.formGroup.get('deliveryType').value && TRANSPORTS.includes(this.keyName)) {
          this.deliveryUnload = !this.deliveryUnload;
          this.deliveryUnloadIcon = STATIONS[(this.deliveryUnload ? this.keyName : 'default')].icon;
        }
      }
    }
  }

  addTariffRoute() {
    this.formGroup.get('isPrepayment').setValue(this.isPrepayment);

    if (this.isEdit) {
      const body = {
        isFixed: getFieldValue(this.formGroup, 'isFixed') ? 1 : 0,
        coefficient: getFieldValue(this.formGroup, 'coefficient') || 1,
        isPrepayment: getFieldValue(this.formGroup, 'isPrepayment') || 0,
        rates: getFieldValue(this.formGroup, 'rates') || [],
        tariff: this.baseTariff.id,
        countryFrom: +getFieldValue(this.formGroup, 'countryFrom', 'id'),
        countryTo: +getFieldValue(this.formGroup, 'countryTo', 'id'),
        deliveryType: +getFieldValue(this.formGroup, 'deliveryType'),
        priceExtra: +getFieldValue(this.formGroup, 'priceExtra') || null,
        regionFrom: +getFieldValue(this.formGroup, 'regionFrom') || null,
        regionTo: +getFieldValue(this.formGroup, 'regionTo') || null,
        localityFrom: +getFieldValue(this.formGroup, 'localityFrom') || null,
        localityTo: +getFieldValue(this.formGroup, 'localityTo') || null,
        loadingRiverport: +getFieldValue(this.formGroup, 'loadingRiverport') || null,
        unloadingRiverport: +getFieldValue(this.formGroup, 'unloadingRiverport') || null,
        loadingSeaport: +getFieldValue(this.formGroup, 'loadingSeaport') || null,
        unloadingSeaport: +getFieldValue(this.formGroup, 'unloadingSeaport') || null,
        loadingAirport: +getFieldValue(this.formGroup, 'loadingAirport') || null,
        unloadingAirport: +getFieldValue(this.formGroup, 'unloadingAirport') || null,
        loadingStation: +getFieldValue(this.formGroup, 'loadingStation') || null,
        unloadingStation: +getFieldValue(this.formGroup, 'unloadingStation') || null,
        activityName: this.baseTariff.activityName,
        category: this.category && this.category.id,
        currency: +getFieldValue(this.formGroup, 'currency') || null
      };

      this.formGroup.get('isFixed').disable();
      this.formGroup.get('priceExtra').disable();
      this.formGroup.get('currency').disable();
      this.formGroup.get('coefficient').disable();
      this.formGroup.get('deliveryType').disable();


      if (this.item) {
        this.itemOnChanged.next({ action: Actions.UPDATE_ROUTE, payload: { id: this.item.id, route: body } });
      } else {
        this.itemOnChanged.next({ action: Actions.CREATE_ROUTE, payload: { route: body } });
      }
      this.isEdit = false;
    } else {
      this.formGroup.get('isFixed').enable();
      this.formGroup.get('priceExtra').enable();
      this.formGroup.get('currency').enable();
      this.formGroup.get('coefficient').enable();
      this.formGroup.get('deliveryType').enable();

      this.isEdit = true;
    }
  }

  onStationChanged(station, keyName, loading) {
    if (station) {
      this.resetLoading(loading);
      const { city, region, country } = station._embedded;
      if (loading) {
        this.loadStation = station;
        patchFieldValue(this.formGroup, 'localityFrom', city && city.id || null);
        patchFieldValue(this.formGroup, 'regionFrom', region.id);
        patchFieldValue(this.formGroup, 'countryFrom', country.id);
        switch (keyName) {
          case 'sea':
            patchFieldValue(this.formGroup, 'loadingSeaport', station.id);
            break;
          case 'plane':
            patchFieldValue(this.formGroup, 'loadingAirport', station.id);
            break;
          case 'train':
            patchFieldValue(this.formGroup, 'loadingStation', station.id);
            break;
        }
      } else {
        this.unloadStation = station;
        patchFieldValue(this.formGroup, 'localityTo', city && city.id || null);
        patchFieldValue(this.formGroup, 'regionTo', region.id);
        patchFieldValue(this.formGroup, 'countryTo', country.id);
        switch (keyName) {
          case 'sea':
            patchFieldValue(this.formGroup, 'unloadingSeaport', station.id);
            break;
          case 'plane':
            patchFieldValue(this.formGroup, 'unloadingAirport', station.id);
            break;
          case 'train':
            patchFieldValue(this.formGroup, 'unloadingStation', station.id);
            break;
        }
      }
    }
  }

  onAreaChanged({ item }, loading) {
    if (item) {
      this.resetLoading(loading);
      const region = item.region;
      if (loading) {
        this.loadStation = null;
        if (item.hasOwnProperty('area')) {
          patchFieldValue(this.formGroup, 'localityFrom', item.id);
        } else {
          patchFieldValue(this.formGroup, 'regionFrom', item.id);
        }
        if (item.hasOwnProperty('country')) {
          patchFieldValue(this.formGroup, 'countryFrom', item.country.id);
        } else if (region && region.hasOwnProperty('country')) {
          patchFieldValue(this.formGroup, 'countryFrom', region.country.id);
          patchFieldValue(this.formGroup, 'regionFrom', region.id);
        }
      } else {
        this.unloadStation = null;
        if (item.hasOwnProperty('area')) {
          patchFieldValue(this.formGroup, 'localityTo', item.id);
        } else {
          patchFieldValue(this.formGroup, 'regionTo', item.id);
        }
        if (item.hasOwnProperty('country')) {
          patchFieldValue(this.formGroup, 'countryTo', item.country.id);
        } else if (region && region.hasOwnProperty('country')) {
          patchFieldValue(this.formGroup, 'countryTo', region.country.id);
          patchFieldValue(this.formGroup, 'regionTo', region.id);
        }
      }
    }
  }

  onDeleteNodeClick(evt) {
    if (this.item) {
      if (this.isEdit) {
        this.formGroup.get('isFixed').disable();
        this.formGroup.get('priceExtra').disable();
        this.formGroup.get('currency').disable();
        this.formGroup.get('coefficient').disable();
        this.formGroup.get('deliveryType').disable();
        this.isEdit = false;
      } else {
        this.itemOnChanged.next({ action: Actions.DELETE_ROUTE, payload: { id: this.item.id } });
      }
    } else {
      this.itemOnChanged.next({ action: Actions.CANCEL_NEW, payload: {} });
    }
  }

  showOrderPriceDialog(evt: any): void {
    evt.stopPropagation();

    this._matDialog.open(OrderPriceDialogComponent, {
      data: {
        node: this.item || this.formGroup.value || {},
        currency: this.formGroup.value.currency && this.currencies.find(currency => currency.id === +this.formGroup.value.currency)
      }
    })
      .afterClosed()
      .pipe(
        first(),
        filter((res: any) => !!res),
      )
      .subscribe((res: any) => {
        if (this.item) {
          this.item.rates = res.rates;
          this.item.currency = this.currencies.find(currency => currency.id === res.currency);
        }

        this.formGroup.patchValue(res);
      });
  }

  private resetLoading(loading: boolean) {
    if (loading) {
      patchFieldValue(this.formGroup, 'countryFrom', null);
      patchFieldValue(this.formGroup, 'regionFrom', null);
      patchFieldValue(this.formGroup, 'localityFrom', null);
      patchFieldValue(this.formGroup, 'loadingRiverport', null);
      patchFieldValue(this.formGroup, 'loadingSeaport', null);
      patchFieldValue(this.formGroup, 'loadingAirport', null);
      patchFieldValue(this.formGroup, 'loadingStation', null);
    } else {
      patchFieldValue(this.formGroup, 'countryTo', null);
      patchFieldValue(this.formGroup, 'regionTo', null);
      patchFieldValue(this.formGroup, 'localityTo', null);
      patchFieldValue(this.formGroup, 'unloadingRiverport', null);
      patchFieldValue(this.formGroup, 'unloadingSeaport', null);
      patchFieldValue(this.formGroup, 'unloadingAirport', null);
      patchFieldValue(this.formGroup, 'unloadingStation', null);
    }
  }
}
