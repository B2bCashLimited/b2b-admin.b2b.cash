import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Unit } from '@b2b/models';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'b2b-plan-settings',
  templateUrl: './plan-settings.component.html',
  styleUrls: ['./plan-settings.component.scss']
})
export class PlanSettingsComponent implements OnInit {
  currencies: Unit[];
  formGroup: FormGroup;
  isForCountry = false;

  constructor(
    private _matDialogRef: MatDialogRef<PlanSettingsComponent>,
    @Inject(MAT_DIALOG_DATA) private _dialogData: any,
    private _formBuilder: FormBuilder) {
  }

  ngOnInit() {
    const node = { ...this._dialogData.node };
    this.currencies = this._dialogData.currencies;
    this.isForCountry = node && node.country && !node.region;
    this.formGroup = this._formBuilder.group({
      isPrepayment: [null, [Validators.required]],
      isFixed: 1,
      coefficient: null,
      priceExtra: null,
      currency: [null, [Validators.required]],
    });
    this.formGroup.get('isFixed').valueChanges
      .subscribe((value) => {
        if (this.isForCountry && value === 1) {
          this.formGroup.get('currency').enable();
        } else {
          this.formGroup.get('currency').disable();
        }
      });
    if (node) {
      const { isFixed, priceExtra, tariff: { price } } = node;
      node.priceExtra = (isFixed && !priceExtra) ? price : node.priceExtra;
      node.currency = node.currency && node.currency.id;

      this.formGroup.patchValue(node);
    }
  }

  onCloseClick(apply: boolean): void {
    this._matDialogRef.close(apply && {...this.formGroup.getRawValue()});
  }

  onChangePriceTypeClick() {
    const { priceExtra, coefficient } = this._dialogData.node;
    if (this.formGroup.get('isFixed').value) {
      this.formGroup.get('isFixed').patchValue(0);
      this.formGroup.get('priceExtra').patchValue(priceExtra);
    } else {
      this.formGroup.get('isFixed').patchValue(1);
      this.formGroup.get('coefficient').patchValue(coefficient);
    }
  }

}
