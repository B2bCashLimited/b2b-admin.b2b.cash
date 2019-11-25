import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChildren, QueryList } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { utc } from 'moment';
import { OrderService } from '@b2b/services/order.service';
import { ConfigService } from '@b2b/services/config.service';
import { LocationService } from '@b2b/services/location.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PaymentStatuses } from 'app/core/enums/statuses';

@Component({
  selector: 'b2b-product-item',
  templateUrl: './product-item.component.html',
  styleUrls: ['./product-item.component.scss']
})
export class ProductItemComponent implements OnInit, OnDestroy {

  @Output() itemChanged = new EventEmitter<{ action: string, payload: any }>();
  @Input() index: number;
  @Output() toggleSelection = new EventEmitter<any>();

  readonly e_PaymentStatuses = PaymentStatuses;

  userAction = null;
  adminCheckboxes: FormGroup;
  proposals = [];
  isCashPayments = false;
  isCashlessPaymentsOnCard = false;
  isCashlessPaymentsVATIncluded = false;
  isCashlessPaymentsWithoutVAT = false;
  waitingForOffers = false;
  isDelivery = false;
  show = false;
  isEdit = false;
  isDisable = false;
  showVolume = false;
  selectedIndex = 0;
  deliveryCity: any;
  filteredActivities: any;
  deliveryAddress: any;
  private _unsubscribe: Subject<void> = new Subject<void>();
  private _item: any;

  constructor(
    public config: ConfigService,
    private _orderService: OrderService,
    private _locationService: LocationService,
    private _fb: FormBuilder) { }

  ngOnInit() {
    this.adminCheckboxes = this._fb.group({
      validModel: [false, Validators.requiredTrue],
      validAmount: [false, Validators.requiredTrue],
      validPrice: [false, Validators.requiredTrue],
      isPickup: false,
      pickupAddress: [{ value: null, disabled: false }, Validators.required],
      isDeliveryAddress: false,
      location: [null],
      deliveryAddress: [{ value: null, disabled: false }, Validators.required],
      isExpired: [false, Validators.requiredTrue],
      expired: [null, Validators.required],
    });

    this.adminCheckboxes.get('validModel').patchValue(!!this.item.adminCheckboxes['validModel']);
    this.adminCheckboxes.get('validAmount').patchValue(!!this.item.adminCheckboxes['validAmount']);
    this.adminCheckboxes.get('validPrice').patchValue(!!this.item.adminCheckboxes['validPrice']);
    this.adminCheckboxes.get('isDeliveryAddress').patchValue(!!this.deliveryAddress);
    this.adminCheckboxes.get('location').patchValue(this.deliveryAddress && this.deliveryAddress.address);
    this.adminCheckboxes.get('deliveryAddress').patchValue(this.deliveryAddress && this.deliveryAddress.id);
    if (this.deliveryAddress) {
      this.adminCheckboxes.get('pickupAddress').disable();
    }

    this.isEdit = !this.deliveryAddress;
  }

  onCheckboxChange(bool: boolean, field: 'pickup' | 'delivery') {
    switch (field) {
      case 'pickup':
        if (bool) {
          this.adminCheckboxes.get('deliveryAddress').reset();
          this.adminCheckboxes.get('deliveryAddress').disable();
          this.adminCheckboxes.get('pickupAddress').enable();
          this.adminCheckboxes.get('isDeliveryAddress').patchValue(false);
          this.adminCheckboxes.get('isDeliveryAddress').disable();
        } else {
          this.adminCheckboxes.get('isDeliveryAddress').enable();
          this.adminCheckboxes.get('pickupAddress').disable();
        }
        break;
      case 'delivery':
        if (bool) {
          this.adminCheckboxes.get('deliveryAddress').enable();
          this.adminCheckboxes.get('pickupAddress').reset();
          this.adminCheckboxes.get('pickupAddress').disable();
          this.adminCheckboxes.get('isPickup').patchValue(false);
          this.adminCheckboxes.get('isPickup').disable();
        } else {
          this.adminCheckboxes.get('deliveryAddress').disable();
          this.adminCheckboxes.get('isPickup').enable();
        }
        break;
    }
  }

  ngOnDestroy() {
    this._unsubscribe.next();
    this._unsubscribe.complete();
  }

  @Input() set item(value) {
    if (this._item !== value) {
      this._item = value;
      if (value) {
        this.normalizeOrderInformation(value);
      }
    }
  }

  get item() {
    return this._item;
  }

  get isPaymentMethod() {
    return (this.isCashPayments ||
      this.isCashlessPaymentsOnCard ||
      this.isCashlessPaymentsVATIncluded ||
      this.isCashlessPaymentsWithoutVAT);
  }

  public onToggleButtonClick() {
    this.isDisable = false;
    if (!this.show && this.item.isCombined) {
      this.getFreeOrder(this.item.childFreeOrders[0]);
    }
    this.show = !this.show;
  }

  private normalizeOrderInformation(value) {
    this.isCashPayments = (value.company && !value.company.individual) ?
      value.company.cashPayments : (value.paymentTypeOptions && value.paymentTypeOptions.cashPayments);
    this.isCashlessPaymentsOnCard = (value.company && !value.company.individual) ?
      value.company.cashlessPaymentsOnCard : (value.paymentTypeOptions && value.paymentTypeOptions.cashlessPaymentsOnCard);
    this.isCashlessPaymentsVATIncluded = (value.company && !value.company.individual) ?
      value.company.cashlessPaymentsVATIncluded : (value.paymentTypeOptions && value.paymentTypeOptions.cashlessPaymentsVATIncluded);
    this.isCashlessPaymentsWithoutVAT = (value.company && !value.company.individual) ?
      value.company.cashlessPaymentsWithoutVAT : (value.paymentTypeOptions && value.paymentTypeOptions.cashlessPaymentsWithoutVAT);
    this.waitingForOffers = +(value.paymentOption && value.paymentOption.id) === 3;

    this.deliveryAddress = value.deliveryAddress;
    this.deliveryCity = this.deliveryAddress && this.deliveryAddress.locality;
    this.isDelivery = !!value.deliveryAddress;
    value.totalNet = (+value.totalNet).toFixed(2);
    value.totalBrut = (+value.totalBrut).toFixed(2);
    this.showVolume = (+value.totalVolume) > 0;
    value.totalVolume = (+value.totalVolume).toFixed(2);
    value.totalCount = Number(value.totalCount);
    value.totalPrice = (+value.totalPrice).toFixed(2);
  }

  onTabGroupChange(evt) {
    this.getFreeOrder(this.item.childFreeOrders[evt.index]);
  }

  getFreeOrder(child: any) {
    if (child) {
      this._orderService.getFreeOrder(child.orderId)
        .subscribe((res) => {
          child.productsCount = res.productsCount;
          child.totalCount = +res.totalCount;
          child.totalPrice = (+res.totalPrice).toFixed(2);
          child.countMe = res.countMe;
          child.totalNet = (+res.totalNet).toFixed(2);
          child.netMe = res.netMe;
          child.totalBrut = (+res.totalBrut).toFixed(2);
          child.brutMe = res.brutMe;
          child.totalVolume = (+res.totalVolume).toFixed(2);
          child.volumeMe = res.volumeMe;
          child.currency = res.currency;
        });
    }
  }

  setCityId(evt) {
    this.deliveryCity = evt;
    if (this.deliveryCity) {
      this.adminCheckboxes.get('location').enable();
    }
  }

  toggleAddress() {
    this.isEdit = !this.isEdit;
  }

  save() {
    if (this.deliveryCity && this.deliveryCity.id && this.adminCheckboxes.get('location').value) {
      let requestUrl;
      const body = {
        locality: +this.deliveryCity.id,
        address: this.adminCheckboxes.get('location').value,
        lat: null,
        lng: null
      };
      if (this.deliveryAddress || this.adminCheckboxes.get('deliveryAddress').value) {
        requestUrl = this._locationService.updateCordinat(+this.deliveryAddress.id, body);
      } else {
        requestUrl = this._locationService.setCordinat(body);
      }

      requestUrl.pipe(takeUntil(this._unsubscribe)).subscribe((res: any) => {
        if (res) {
          this.isEdit = false;
          this.deliveryAddress = res;
          this.adminCheckboxes.get('deliveryAddress').patchValue(res.id);
        }
      });
    }
  }

  onDelete() {
    this.itemChanged.next({ action: 'deleteOrder', payload: { id: +this.item.id } });
  }

  onSubmit() {
    if (this.adminCheckboxes.invalid) {
      return null;
    }

    const payload = {
      id: this.item.id,
      validModel: this.adminCheckboxes.get('validModel').value ? 1 : 0,
      validAmount: this.adminCheckboxes.get('validAmount').value ? 1 : 0,
      validPrice: this.adminCheckboxes.get('validPrice').value ? 1 : 0,
      pickupAddress: this.adminCheckboxes.get('pickupAddress').value,
      deliveryAddress: +this.adminCheckboxes.get('deliveryAddress').value,
      expiredDate: this.adminCheckboxes.get('expired').value &&
        utc(this.adminCheckboxes.get('expired').value).format('YYYY-MM-DD HH:mm')
    };

    this.itemChanged.next({ action: 'updateOrder', payload });
  }

  onChecked() {
    this.toggleSelection.emit(this.item);
  }
}
