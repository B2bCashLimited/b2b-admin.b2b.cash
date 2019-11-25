import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatChipInputEvent, MatDialogRef} from '@angular/material';
import {FormBuilder, FormGroup} from '@angular/forms';
import {UnitsService} from '@b2b/services/units.service';
import {Observable} from 'rxjs';
import {ControlUnitType, Unit} from '@b2b/models';
import {ENTER} from '@angular/cdk/keycodes';

@Component({
  selector: 'b2b-add-business-property-dialog',
  templateUrl: './category-business-property-dialog.component.html',
  styleUrls: ['./category-business-property-dialog.component.scss']
})
export class CategoryBusinessPropertyDialogComponent implements OnInit {
  readonly separatorKeysCodes: number[] = [ENTER];
  formGroup: FormGroup;
  controlUnitTypes$: Observable<ControlUnitType[]>;

  constructor(
    private _matDialogRef: MatDialogRef<CategoryBusinessPropertyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private _dialogData: any,
    private _formBuilder: FormBuilder,
    private _unitsService: UnitsService) {
  }

  ngOnInit() {
    this.controlUnitTypes$ = this._unitsService.getControlUnitTypes();
    this.formGroup = this._formBuilder.group({
      category: null,
      enabled: false,
      nameCn: null,
      nameEn: null,
      nameRu: null,
      priority: 0,
      valueType: null,
      unitsList: [[]],
      valuesList: [[]],
    });
    if (this._dialogData.categoryProperty) {
      this.formGroup.patchValue(this._dialogData.categoryProperty);
    }
  }

  onCloseClick(add: boolean): void {
    this._matDialogRef.close(add ? this.formGroup.value : null);
  }

  add(event: MatChipInputEvent, prop: string): void {
    const input = event.input;
    const value = event.value;
    if ((value || '').trim()) {
      this.formGroup.value[prop]
        .push({display: value.trim(), value: value.trim()});
    }
    if (input) {
      input.value = '';
    }
  }

  remove(fruit: any, prop: string): void {
    const index = this.formGroup.value[prop].indexOf(fruit);
    if (index >= 0) {
      this.formGroup.value[prop].splice(index, 1);
    }
  }

}
