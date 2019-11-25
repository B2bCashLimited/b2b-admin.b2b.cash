import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'b2b-order-price-dialog',
  templateUrl: './order-price-dialog.component.html',
  styleUrls: ['./order-price-dialog.component.scss']
})
export class OrderPriceDialogComponent implements OnInit {

  formGroup: FormGroup;
  displayedColumns = ['order-sum', 'tariff', 'actions'];
  currency: number;

  constructor(private _formBuilder: FormBuilder,
              @Inject(MAT_DIALOG_DATA) private _dialogData: any,
              private _matDialog: MatDialogRef<OrderPriceDialogComponent>) {
  }

  ngOnInit(): void {
    if (this._dialogData.node.rates && this._dialogData.node.rates.length > 0) {
      (this._dialogData.node.rates as any[]).map(value => value.edit = false);
    }

    this.formGroup = this._formBuilder.group({
      rates: this._formBuilder.array(this._addControlsToRates(this._dialogData.node.rates)),
      currency: this._dialogData.node.currency && +this._dialogData.node.currency.id
        || this._dialogData.currency && +this._dialogData.currency.id || null
    });
    this.currency = this._dialogData.node.currency && +this._dialogData.node.currency.id
      || this._dialogData.currency && +this._dialogData.currency.id || null;
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
    const defaultRatesArr = this._addControlsToRates(this._dialogData.node.rates);

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

  close(save = false): void {
    const data: any = this.formGroup.value;

    if (save) {
      (data.rates as any[]).map(value => delete value.edit);
    }

    this._matDialog.close(save ? data : null);
  }

  onSelectedCurrencyChanged(currencyId: number): void {
    this.formGroup.get('currency').setValue(currencyId);
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
