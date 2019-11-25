import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatChipInputEvent, MatDialogRef, MatDialog } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UnitsService } from '@b2b/services/units.service';
import { Observable } from 'rxjs';
import { ControlUnitType, Unit } from '@b2b/models';
import { CategoryPropertySpecial, UnitType } from '@b2b/enums';
import { ENTER } from '@angular/cdk/keycodes';
import { map } from 'rxjs/operators';
import { isSpecialCategory } from '@b2b/utils';
import { PropertyOverrideDialogComponent } from '../property-override-dialog/property-override-dialog.component';

@Component({
  selector: 'b2b-category-feature-dialog',
  templateUrl: './category-feature-dialog.component.html',
  styleUrls: ['./category-feature-dialog.component.scss']
})
export class CategoryFeatureDialogComponent implements OnInit {

  readonly separatorKeysCodes: number[] = [ENTER];
  formGroup: FormGroup;
  controlUnitTypes$: Observable<ControlUnitType[]>;
  units$: Observable<Unit[]>;
  possibleValuesRu: any = [];
  namedCharacteristic = false;
  comparativeCharacteristics = false;
  isEditMode = false;
  withFormula = false;
  private _property: any;

  constructor(
    private _matDialogRef: MatDialogRef<CategoryFeatureDialogComponent>,
    private _matDialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) private _dialogData: any,
    private _formBuilder: FormBuilder,
    private _unitsService: UnitsService) {
  }

  ngOnInit(): void {
    this._initFormGroup();

    if (this._dialogData.categoryProperty) {
      this.possibleValuesRu = [...this._dialogData.categoryProperty.possibleValuesRu];
      this._property = this._dialogData.categoryProperty;
      const { special } = this._dialogData.categoryProperty;
      this.isEditMode = true;
      this.namedCharacteristic = special === CategoryPropertySpecial.Named;
      this.comparativeCharacteristics = special === CategoryPropertySpecial.Compared;
      this.withFormula = special === CategoryPropertySpecial.WithFormula;
      this.formGroup.patchValue(this._dialogData.categoryProperty);
    } else if (this._dialogData.categoryId) {
      this.formGroup.get('category').patchValue(this._dialogData.categoryId);
    }

    this.units$ = this._unitsService.getUnits();
    this.controlUnitTypes$ = this._unitsService.getControlUnitTypes()
      .pipe(
        map((controlUnitTypes: any) => {
          if (this.withFormula) {
            return controlUnitTypes.filter(item => item.id === UnitType.Calculated);
          }

          return controlUnitTypes;
        })
      );
  }

  canOverride(value: string): boolean {
    const posValue = this.possibleValuesRu.find((item) => item.value === value);
    return !!posValue;
  }

  onCloseClick(add: boolean): void {
    const value: any = {...this.formGroup.value};

    if (!this.withFormula) {
      if (this.namedCharacteristic) {
        value.special = CategoryPropertySpecial.Named;
      } else if (this.comparativeCharacteristics) {
        value.special = CategoryPropertySpecial.Compared;
      } else {
        value.special = CategoryPropertySpecial.Simple;
      }
    }

    value.useArea = 1;
    value.enabled = +value.enabled || +isSpecialCategory(value.special);
    value.orderEnabled = isSpecialCategory(value.special) ? 1 : 0;
    value.yandexPropertyName = this._dialogData.yandexPropertyName ? this._dialogData.yandexPropertyName : null;
    this._matDialogRef.close(add ? value : null);
  }

  overrideProperty(index) {
    if (!this.formGroup.get('possibleValuesRu').value[index] ||
      !this.formGroup.get('possibleValuesCn').value[index] ||
      !this.formGroup.get('possibleValuesEn').value[index]) {
      return null;
    }
    const overrideValue = {
      ru: this.formGroup.get('possibleValuesRu').value[index].value,
      en: this.formGroup.get('possibleValuesEn').value[index].value,
      cn: this.formGroup.get('possibleValuesCn').value[index].value
    };

    this._matDialog.open(PropertyOverrideDialogComponent, {
      width: '500px',
      data: {
        property: this._property,
        isOverride: true,
        overrideValue,
      }
    }).afterClosed().subscribe();
  }

  onAddPossibleValueClick(evt: MatChipInputEvent, prop: string): void {
    const {input, value} = evt;

    if ((value || '').trim()) {
      this.formGroup.value[prop].push({display: value.trim(), value: value.trim()});
    }

    if (input && input.value) {
      input.value = '';
    }
  }

  onRemovePossibleValueClick(fruit: any, prop: string): void {
    const index = this.formGroup.value[prop].indexOf(fruit);

    if (index >= 0) {
      this.formGroup.value[prop].splice(index, 1);
    }
  }

  private _initFormGroup(): void {
    this.formGroup = this._formBuilder.group({
      category: null,
      controlUnitType: null,
      enabled: false,
      nameRu: [null, [Validators.required]],
      nameEn: [null, [Validators.required, Validators.pattern(/[\u0000-~\u2000-\u206e]+$/ig)]],
      nameCn: [null, [Validators.required]],
      orderEnabled: 0,
      possibleValuesCn: [[]],
      possibleValuesEn: [[]],
      possibleValuesRu: [[]],
      special: 0,
      priority: 0,
      unit: null,
      useArea: 1,
      valueType: [null, [Validators.required]],
    });
  }

}
