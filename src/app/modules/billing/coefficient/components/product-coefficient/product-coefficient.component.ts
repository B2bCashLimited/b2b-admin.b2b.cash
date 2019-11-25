import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { BillingService } from '@b2b/services/billing.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Actions } from '@b2b/enums';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'b2b-product-coefficient',
  templateUrl: './product-coefficient.component.html',
  styleUrls: ['./product-coefficient.component.scss']
})
export class ProductCoefficientComponent implements OnInit, OnDestroy {

  get item(): any {
    return this._item;
  }

  @Input() set item(value: any) {
    if (this._item !== value) {
      this._item = value;
      (this._item.rates as any[]).map(item => item.edit = false);
    }
  }

  @Input() currencies: any;
  @Output() itemChange = new EventEmitter<{action: string, payload: any}>();

  formGroup: FormGroup;
  isEdit = false;
  isCustom = false;
  displayedColumns = ['order-sum', 'tariff', 'actions'];

  private _item: any;
  private _unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private _route: ActivatedRoute,
    private _billingService: BillingService,
    private _formBuilder: FormBuilder) {
  }

  ngOnDestroy(): void {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.isCustom = this._route.snapshot.queryParams.isCustom;
    this._initFormGroup();
    this._handlePrepayment();
  }

  onChangePriceClick() {
    if (this.formGroup.get('isFixed').value) {
      this.formGroup.get('isFixed').patchValue(false);
      this.formGroup.get('priceExtra').patchValue(this._item.priceExtra);
    } else {
      this.formGroup.get('isFixed').patchValue(true);
      this.formGroup.get('coefficient').patchValue(this._item.coefficient);
    }
  }

  onSaveClick(): void {
    if (this.isEdit) {
      this.onSubmit();
    } else {
      this.isEdit = true;
    }
  }

  onSubmit(): void {
    const {isFixed, rates} = this.formGroup.value;
    (rates as any[]).map(value => delete value.edit);
    const body: any = {
      ...this.formGroup.getRawValue(),
      isFixed: isFixed ? 1 : 0,
      rates
    };
    let reqMethod: Observable<any>;

    if (this.isCustom) {
      reqMethod = this._billingService.updateTariffRoute(this._item.id, body);
    } else {
      reqMethod = this._billingService.updateTariff(this._item.id, body);
    }

    reqMethod
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe(res => this._item = res);
  }

  onDeleteClick() {
    if (!this.isEdit) {
      this.itemChange.emit({action: Actions.DELETE_TARIFF, payload: {id: this._item.id}});
    }
    this.isEdit = false;
  }

  addRate(): void {
    const rates = this.formGroup.get('rates') as FormArray;
    rates.push(this._createDefaultRateItem());
  }

  removeRate(index: number): void {
    const rates = this.formGroup.get('rates') as FormArray;
    rates.removeAt(index);
  }

  saveOrEditRate(index: number, bool: boolean): void {
    const rates = this.formGroup.get('rates') as FormArray;
    rates.at(index).get('edit').setValue(bool);
  }

  cancelAddedRates(): void {
    const rates = this.formGroup.get('rates') as FormArray;
    const defaultRatesArr = this._addControlsToRates(this.item.rates);

    while (rates.length !== 0) {
      rates.removeAt(0);
    }

    for (let i = 0; i < defaultRatesArr.length; i++) {
      const defaultRatesArrElement = defaultRatesArr[i];
      rates.insert(i, defaultRatesArrElement);
    }
  }

  trackByFn(index: any, item: any) {
    return index;
  }

  onSelectedCurrencyChanged(currencyId: number): void {
    this.formGroup.get('currency').setValue(currencyId);
  }

  private _initFormGroup(): void {
    this.formGroup = this._formBuilder.group({
      coefficient: this._item.coefficient || 1,
      priceExtra: this._item.priceExtra || null,
      currency: {value: this._item.currency && this._item.currency.id, disabled: true},
      isFixed: this._item.isFixed || false,
      isPrepayment: this._item.isPrepayment || 0,
      rates: this._formBuilder.array(this._addControlsToRates(this.item.rates))
    });
  }

  private _handlePrepayment(): void {
    this.formGroup.get('isPrepayment').valueChanges
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe(res => {
        if (!!res) {
          this.formGroup.get('coefficient').disable();
          this.formGroup.get('priceExtra').disable();
          this.formGroup.get('currency').disable();
        } else {
          this.formGroup.get('coefficient').enable();
          this.formGroup.get('priceExtra').enable();
          this.formGroup.get('currency').enable();
        }
      });
  }

  private _createDefaultRateItem(): FormGroup {
    return this._formBuilder.group({
      min: [null, Validators.required],
      max: [null, Validators.required],
      rate: [null, [Validators.required, Validators.min(0.1), Validators.max(100)]],
      edit: true
    });
  }

  private _addControlsToRates(arr: any[]): any[] {
    const modifiedArr: any[] = [];

    if (arr && arr.length > 0) {
      for (let i = 0; i < arr.length; i++) {
        const arrElement = arr[i];
        const formGroup: FormGroup = this._formBuilder.group(arrElement);
        formGroup.get('min').setValidators(Validators.required);
        formGroup.get('max').setValidators(Validators.required);
        formGroup.get('rate').setValidators([Validators.required, Validators.min(0.1), Validators.max(100)]);
        formGroup.updateValueAndValidity();
        modifiedArr.push(formGroup);
      }

      return modifiedArr;
    } else {
      return [this._createDefaultRateItem()];
    }
  }
}
