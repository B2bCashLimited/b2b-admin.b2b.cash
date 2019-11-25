import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { TreeComponent } from '@b2b/shared/modules';
import { CategoryService } from '@b2b/services/category.service';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { findIndex } from 'lodash';

@Component({
  selector: 'b2b-scheme-tab-dictionary',
  templateUrl: './scheme-tab-dictionary.component.html',
  styleUrls: ['./scheme-tab-dictionary.component.scss']
})
export class SchemeTabDictionaryComponent implements OnInit {
  @Input() formGroup: FormGroup;
  dataSource: any[] = [];
  possibleValues: any[] = [];
  categoryProperties: any[] = [];

  private _fields: string[] = [];
  private _valuesStat: string[] = [];

  constructor(
    private _categoryService: CategoryService,
    private _matDialog: MatDialog,
    private _fb: FormBuilder
  ) { }

  ngOnInit() {
    if (this.formGroup.value) {
      Object.keys(this.formGroup.value).forEach((key, i) => {
        if (this.formGroup.value[key].category) {
          this._categoryService.getCategoryFeaturesProperties(this.formGroup.value[key].category).subscribe(({ categoryProperties }) => {
            this.dataSource.push({
              pos: i,
              ctrlName: key,
              category: this.formGroup.value[key].categoryObject,
              categoryProperties
            });
          });
        } else {
          this.dataSource.push({
            pos: i,
            ctrlName: key,
            category: null,
            categoryProperties: [],
          });
        }
      });
    }
  }

  get fields(): string[] {
    return this._fields;
  }

  @Input() set fields(values: string[]) {
    this._fields = values;
  }

  get valuesStat(): string[] {
    return this._valuesStat;
  }

  @Input() set valuesStat(values: string[]) {
    this._valuesStat = values;
  }

  getValuesForField(field) {
    return this.valuesStat[field] ? Object.keys(this.valuesStat[field]) : [];
  }

  posValueChanges(item) {
    const index = findIndex(this.filteredPossibleValues(item), (pv: any) => {
      return pv.value === this.formGroup.get(`${item.ctrlName}.posValue`).value;
    });
    const selectProperty = this.formGroup.get(`${item.ctrlName}.prop`).value;
    const catProperty = item.categoryProperties.find((cp) => +cp.id === +selectProperty);
    this.formGroup.get(`${item.ctrlName}.posValueObject`).setValue({
      en: catProperty.possibleValuesEn[index].value,
      ru: catProperty.possibleValuesRu[index].value,
      cn: catProperty.possibleValuesCn[index].value
    });
  }

  propChanges(item) {
    const selectProperty = this.formGroup.get(`${item.ctrlName}.prop`).value;
    const catProperty = item.categoryProperties.find((cp) => +cp.id === +selectProperty);

    this.formGroup.get(`${item.ctrlName}.propObject`).setValue({
      en: catProperty.nameEn,
      ru: catProperty.nameRu,
      cn: catProperty.nameCn
    });
  }


  selectCategory(item) {
    this._matDialog.open(TreeComponent, {
      width: '800px',
      data: {
        multiple: false
      }
    }).afterClosed().pipe(
      switchMap((category) => {
        if (category) {
          this.formGroup.get(`${item.ctrlName}.category`).setValue(category.id);
          this.formGroup.get(`${item.ctrlName}.categoryObject`).setValue(category);
          item.category = category;
          return this._categoryService.getCategoryFeaturesProperties(category.id);
        }
        return of(null);
      })
    ).subscribe((res) => {
      if (res) {
        item.categoryProperties = res.categoryProperties;
      }
    });
  }

  filteredCategoryProperties(props: any[], bool: boolean) {
    if (bool) {
      return props.filter((cp) => cp.valueType === 3);
    }
    return props;
  }

  onRadioChange(type, item, ctrl) {
    item.radio = type;

    if (ctrl.value) {
      ctrl.get('valueStat').setValue(null);
    }
  }

  filteredPossibleValues(item) {
    const selectProperty = this.formGroup.get(`${item.ctrlName}.prop`).value;
    if (item.categoryProperties.find((cp) => +cp.id === +selectProperty)) {
      return item.categoryProperties.find((cp) => +cp.id === +selectProperty).possibleValuesRu;
    }

    return [];
  }

  resetValueForField(ctrl) {
    if (ctrl.value) {
      ctrl.get('valueStat').setValue(null);
    }
  }

  addRow() {
    const length = this.dataSource.length;
    this.dataSource.push({
      pos: length,
      ctrlName: `prop${length}`,
      category: null,
      categoryProperties: [],
    });
    this.formGroup.addControl(`prop${length}`, this._fb.group({
      type: 1,
      field: null,
      valueStat: null,
      category: null,
      categoryObject: null,
      prop: null,
      propObject: null,
      value: null,
      posValue: null,
      posValueObject: null
    }));
  }

  deleteRow(row: any) {
    this.dataSource = this.dataSource.filter((item) => item.pos !== row.pos);
    this.formGroup.removeControl(`${row.ctrlName}`);
  }
}
