import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormArray, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { TreeComponent } from '@b2b/shared/modules/tree/tree.component';
import { CategoryService } from '@b2b/services/category.service';
import { RegexDialogComponent } from '@b2b/shared/dialogs';

interface ItemModel {
  pos: number;
  ctrlName: string;
}

@Component({
  selector: 'b2b-scheme-tab-ext-prop',
  templateUrl: './scheme-tab-ext-prop.component.html',
  styleUrls: ['./scheme-tab-ext-prop.component.scss']
})
export class SchemeTabExtPropComponent implements OnInit {
  @Input() categoryArray: FormArray;
  @Input() categoriesValues: any[];

  categoriesSelectArray: any[] = [];

  dictionariesDataSources: any[] = [];

  private _fieldsStat: string[] = [];
  private _valuesStat: string[] = [];

  constructor(
    private _matDialog: MatDialog,
    private _categoryService: CategoryService,
    private _fb: FormBuilder,
  ) { }

  get fieldsStat(): string[] {
    return this._fieldsStat;
  }

  @Input() set fieldsStat(values: string[]) {
    this._fieldsStat = values;
  }

  get valuesStat(): string[] {
    return this._valuesStat;
  }

  @Input() set valuesStat(values: string[]) {
    this._valuesStat = values;
  }

  ngOnInit() {
    this.categoryArray.value.forEach((category, i) => {
      this.categoriesSelectArray.push(category.value);

      if (category.category) {
        if (!category.category.nameRu) {
          this._categoryService.getCategoryById(category.category.id).subscribe((res) => {
            this.categoryArray.controls[i].get('category').setValue(res);
          });
        }
        this._categoryService.getCategoryFeaturesProperties(category.category.id).subscribe(({ categoryProperties }) => {
          this.dictionariesDataSources[i] = categoryProperties;
        });
      }
    });
  }

  removeCategory(index) {
    this.categoryArray.removeAt(index);
    this.dictionariesDataSources.splice(index, 1);
  }

  selectCategoryForArray(category, index) {
    this._matDialog.open(TreeComponent, {
      width: '800px',
      data: {
        multiple: false
      }
    }).afterClosed().subscribe((res) => {
      category.get('category').setValue(res);
      const propertiesLength = category.get('properties').controls.length;

      for (let i = 0; i < propertiesLength; i++) {
        category.get('properties').removeAt(i);
      }

      this._categoryService.getCategoryFeaturesProperties(res.id).subscribe(({ categoryProperties }) => {
        this.dictionariesDataSources[index] = categoryProperties;
      });
    });
  }

  addRow(category, type?: number, missing?: boolean) {
    category.get('properties').push(this._fb.group({
      type: type || 1,
      subType: 1,
      prop: null,
      propObj: null,
      column: null,
      value: null,
      regex: null,
      collectStats: false,
      rules: [],
      missing: missing || false
    }));
  }

  deleteRow(properties, index) {
    properties.removeAt(index);
  }

  setPropNameForProperty(property, event, i) {
    const prop = this.dictionariesDataSources[i].find(val => val.id === parseInt(event.target.value, 10));

    if (prop) {
      property.get('propObj').setValue(prop);
    }
  }

  changeColumnValue(event, column) {
    column.setValue({
      column: event.target.value,
      name: null
    });
  }

  compareFn(c1: any, c2: any): boolean {
    return c1 && c2 ? c1.name === c2.name : c1 === c2;
  }

  changeCategoryOrder(index, event) {
    const changedControlValues = { ...this.categoryArray.at(index).value };
    const changedControl = this.categoryArray.at(index);
    const changedWithControlIndex = this.categoryArray.value.findIndex(category => category.value === event.target.value);
    const changedWithControlValues = { ...this.categoryArray.at(changedWithControlIndex).value };
    const changedWithControl = this.categoryArray.at(changedWithControlIndex);

    const changedDictSource = this.dictionariesDataSources[index];
    const changedWithDictSource = this.dictionariesDataSources[changedWithControlIndex];

    this.dictionariesDataSources[index] = changedWithDictSource;
    this.dictionariesDataSources[changedWithControlIndex] = changedDictSource;

    this.categoriesSelectArray[changedWithControlIndex] = changedControlValues.value;

    changedWithControl.get('value').setValue(changedControlValues.value);
    changedWithControl.get('category').setValue(changedControlValues.category);
    changedControl.get('value').setValue(event.target.value);
    changedControl.get('category').setValue(changedWithControlValues.category);

    this.clearFormArray(changedWithControl.get('properties') as FormArray);
    this.clearFormArray(changedControl.get('properties') as FormArray);

    changedControlValues.properties.forEach(property => {
      (changedWithControl.get('properties') as FormArray).push(this._fb.group(property));
    });
    changedWithControlValues.properties.forEach(property => {
      (changedControl.get('properties') as FormArray).push(this._fb.group(property));
    });
  }

  clearFormArray(formArray: FormArray) {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }

  onRadioChange(type, property) {
    if (type === 1) {
      property.get(`column`).enable();
      property.get(`collectStats`).enable();
      property.get(`value`).disable();
      property.get(`regex`).disable();
    } else if (type === 2) {
      property.get(`value`).enable();
      property.get(`regex`).disable();
      property.get(`column`).disable();
      property.get(`collectStats`).disable();
    } else if (type === 3) {
      property.get(`column`).enable();
      property.get(`collectStats`).enable();
      property.get(`regex`).enable();
      property.get(`value`).disable();
    }
  }

  openRegexEdit(control) {
    const column = control.get('column').value ? control.get('column').value.column : null;
    const rules = control.get('rules').value;

    this._matDialog.open(RegexDialogComponent, {
      width: '1100px',
      data: {
        rules,
        valuesStat: column && this.valuesStat[column] ? Object.keys(this.valuesStat[column]) : []
      }
    }).afterClosed().subscribe((res) => {
      if (res) {
        control.get('regex').setValue(res.regex ? res.regex : null);
        control.get('rules').setValue(res.rules);
      }
    });
  }
}
