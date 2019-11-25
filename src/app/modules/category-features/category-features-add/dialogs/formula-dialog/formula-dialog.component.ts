import {Component, Inject, OnInit, Pipe, PipeTransform} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CategoryPropertySpecial} from '@b2b/enums';

@Component({
  selector: 'b2b-formula-dialog',
  templateUrl: './formula-dialog.component.html',
  styleUrls: ['./formula-dialog.component.scss']
})
export class FormulaDialogComponent implements OnInit {
  categoryProperty: any;
  categoryProperties: any;
  formGroup: FormGroup;
  actions = [
    {
      label: 'Умножить',
      value: 'multiply'
    },
    {
      label: 'Разделить',
      value: 'divide'
    },
    {
      label: 'Отнять',
      value: 'minus'
    },
    {
      label: 'Сложить',
      value: 'plus'
    },
    {
      label: 'Равно',
      value: 'equal'
    }
  ];

  constructor(
    private _matDialogRef: MatDialogRef<FormulaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private _dialogData: any,
    private _formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.categoryProperty = this._dialogData.categoryProperty;
    this.categoryProperties = this._dialogData.categoryProperties
      .filter(item => item.id !== this.categoryProperty.id);
    this.formGroup = this._formBuilder.group({
      mainProperty: null,
      property: [{value: null, disabled: true}],
      action: [{value: null, disabled: true}],
      formula: [[]],
    });
    this.formGroup.get('mainProperty').valueChanges
      .subscribe(() => {
        this.formGroup.get('action').enable();
        this.formGroup.get('property').enable();
      });
    this.formGroup.get('action').valueChanges
      .subscribe((res: any) => {
        if (res && res.value === 'equal') {
          this.formGroup.get('property').disable();
        } else {
          this.formGroup.get('property').enable();
        }
      });
    const formula = this.categoryProperty.formula;
    if (formula && formula.value && typeof formula.value === 'string') {
      const items = [];
      const arr = formula.value.split(' ');
      const propId = +arr.shift();
      arr.forEach(item => {
        const [act, id] = item.split(';');
        const action = this.actions.find(prop => prop.value === act);
        const property = this.categoryProperties.find(prop => prop.id === +id);
        items.push({property, action});
      });
      this.formGroup.get('mainProperty').patchValue(propId);
      this.formGroup.get('formula').patchValue(items);
    } else if (formula && formula.value) {
      this.formGroup.get('mainProperty').patchValue(+formula.value);
      const action = this.actions.find(prop => prop.value === 'equal');
      this.formGroup.get('action').patchValue(action);
    }
  }

  onAddClick(): void {
    const {formula, property, action} = this.formGroup.value;
    this.formGroup.get('formula').patchValue([...formula, {property, action}]);
    this.formGroup.get('property').patchValue(null);
    this.formGroup.get('action').patchValue(null);
  }

  onDestroyClick(idx: number): void {
    const {formula} = this.formGroup.value;
    formula.splice(idx, 1);
    this.formGroup.get('formula').patchValue([...formula]);
  }

  onCloseClick(add: boolean): void {
    if (add) {
      const {mainProperty, formula, action} = this.formGroup.value;
      let value;
      if (formula && formula.length > 0) {
        value = formula.map(item => `${item.action.value};${item.property.id}`).join(' ');
      }
      const data: any = {
        isFormula: true,
        valueType: this.categoryProperty.valueType,
        orderEnabled: 1,
        special: this.categoryProperty.special,
      };
      if (action && action.value === 'equal') {
        data.formula = {value: mainProperty};
      } else {
        data.formula = value ? {value: `${mainProperty} ${value}`} : null;
      }
      this._matDialogRef.close(data);
    } else {
      this._matDialogRef.close(null);
    }
  }

}

@Pipe({
  name: 'propertyPipe'
})
export class PropertyPipe implements PipeTransform {
  transform(value: any[], id: number) {
    return (value || []).filter(item => item.id !== id);
  }
}
