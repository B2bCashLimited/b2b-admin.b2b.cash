import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {FormBuilder, FormGroup} from '@angular/forms';
import {UnitsService} from '@b2b/services/units.service';
import {Observable} from 'rxjs';
import {ControlUnitType, Unit} from '@b2b/models';

@Component({
  selector: 'b2b-order-business-property-dialog',
  templateUrl: './order-business-property-dialog.component.html',
  styleUrls: ['./order-business-property-dialog.component.scss']
})
export class OrderBusinessPropertyDialogComponent implements OnInit {
  formGroup: FormGroup;
  controlUnitTypes$: Observable<ControlUnitType[]>;
  units$: Observable<Unit[]>;

  constructor(
    private _matDialogRef: MatDialogRef<OrderBusinessPropertyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private _dialogData: any,
    private _formBuilder: FormBuilder,
    private _unitsService: UnitsService) {
  }

  ngOnInit() {
    this.controlUnitTypes$ = this._unitsService.getControlUnitTypes();
    this.units$ = this._unitsService.getUnits();
    this.formGroup = this._formBuilder.group({
      controlUnitType: null,
      enabled: false,
      nameCn: null,
      nameEn: null,
      nameRu: null,
      orderForm: null,
      priority: 0,
      unit: null,
      value: null,
    });
    if (this._dialogData.categoryProperty) {
      this.formGroup.patchValue(this._dialogData.categoryProperty);
    }
  }

  onCloseClick(add: boolean): void {
    this._matDialogRef.close(add ? this.formGroup.value : null);
  }

}
