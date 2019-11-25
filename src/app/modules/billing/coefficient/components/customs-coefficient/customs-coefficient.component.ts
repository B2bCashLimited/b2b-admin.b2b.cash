import { BillingService } from '@b2b/services/billing.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Unit } from '@b2b/models';
import { Actions } from '@b2b/enums';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'b2b-customs-coefficient',
  templateUrl: './customs-coefficient.component.html',
  styleUrls: ['./customs-coefficient.component.scss']
})
export class CustomsCoefficientComponent implements OnInit {
  @Input() deliveryTypes: any[];
  @Input() item: any;
  @Input() baseTariff: any;
  @Input() category: any;
  @Input() currencies: Unit[];
  @Output() itemChange = new EventEmitter<{ action: string, payload: any }>();

  isNewRoute = false;
  isExtended = false;
  isEdit = false;
  formGroup: FormGroup;
  tariffRoutes: any[] = [];

  constructor(
    private _billingService: BillingService,
    private _fb: FormBuilder) {
  }

  ngOnInit() {
    const item: any = { ...this.item };
    item['currency'] = this.item.currency && this.item.currency.id;
    item.isPrepayment = !!item.isPrepayment ? 1 : 0;
    this.formGroup = this._fb.group({
      coefficient: item.coefficient || 0,
      priceExtra: item.priceExtra || null,
      isFixed: item.isFixed || false,
      isPrepayment: item.isPrepayment || 0,
      currency: { value: null, disabled: true }
    });
  }

  onChangePriceClick(evt) {
    evt.stopPropagation();
    if (this.formGroup.get('isFixed').value) {
      this.formGroup.get('isFixed').patchValue(false);
      this.formGroup.get('priceExtra').patchValue(this.item.priceExtra);
    } else {
      this.formGroup.get('isFixed').patchValue(true);
      this.formGroup.get('coefficient').patchValue(this.item.coefficient);
    }
  }

  onRouteChanged({ action, payload }) {
    switch (action) {
      case Actions.CREATE_ROUTE:
        this.createRoute(payload.route);
        break;
      case Actions.UPDATE_ROUTE:
        this.updateRoute(payload.id, payload.route);
        break;
      case Actions.DELETE_ROUTE:
        this.deleteRoute(payload.id);
        break;
      case Actions.CANCEL_NEW:
        this.isNewRoute = false;
        break;
    }
  }

  createRoute(body): void {
    this._billingService.createTariffRoute(body)
      .pipe(
        switchMap(res => {
          this.tariffRoutes.push(res);
          this.isNewRoute = false;

          const { isFixed, isPrepayment } = this.formGroup.value;
          const data: any = {
            ...this.formGroup.getRawValue(),
            isFixed: isFixed ? 1 : 0,
            isPrepayment: isPrepayment || 0,
          };
          return this._billingService.updateTariffRoute(this.item.id, data);
        })
      )
      .subscribe(res => {
        this.item = res;
        this.isEdit = false;
      });
  }

  updateRoute(id, body): void {
    this._billingService.updateTariffRoute(id, body)
      .pipe(
        switchMap(res => {
          this.tariffRoutes.map(tr => {
            if (+tr.id === +id) {
              tr = res;
            }
            return tr;
          });
          this.isNewRoute = false;

          const { isFixed, isPrepayment } = this.formGroup.value;
          const data: any = {
            ...this.formGroup.getRawValue(),
            isFixed: isFixed ? 1 : 0,
            isPrepayment: isPrepayment || 0,
          };
          return this._billingService.updateTariffRoute(this.item.id, data);
        })
      )
      .subscribe(res => {
        this.item = res;
        this.isEdit = false;
      });
  }

  deleteRoute(id): void {
    this._billingService.deleteTariffRoute(id)
      .subscribe(() => this.tariffRoutes = this.tariffRoutes.filter((tr) => +tr.id !== +id));
  }

  addNewRoute(evt: MouseEvent) {
    evt.stopPropagation();
    this.isNewRoute = true;
    this.isExtended = true;
  }

  onPanelOpen() {
    const query = {
      activityName: this.item.activityName.id,
      tariff: this.item.tariff.id,
      category: this.item.category.id,
      hasDelivery: true
    };
    this._billingService.getTariffRoutes(query).subscribe((res) => {
      this.tariffRoutes = res.tariffRoutes;
    });
  }

  onPanelClose() {
    this.isNewRoute = false;
  }

  onSaveClick(evt) {
    evt.stopPropagation();
    if (this.isEdit) {
      const { isFixed, isPrepayment } = this.formGroup.value;
      const body = {
        ...this.formGroup.getRawValue(),
        isFixed: isFixed ? 1 : 0,
        isPrepayment: isPrepayment || 0,
      };
      this._billingService.updateTariffRoute(this.item.id, body)
        .subscribe((res) => {
          this.item = res;
          this.isEdit = false;
        });
    } else {
      this.isEdit = true;
    }
  }

  onDeleteClick(evt) {
    evt.stopPropagation();
    if (!this.isEdit) {
      this.itemChange.emit({ action: Actions.DELETE_TARIFF, payload: { id: this.item.id } });
    }
    this.isEdit = false;
  }
}
