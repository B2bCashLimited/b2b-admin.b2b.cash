import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormArray, FormControl, FormBuilder, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { TreeComponent } from '@b2b/shared/modules/tree/tree.component';
import { CategoryService } from '@b2b/services/category.service';
import { SchemeWarningDialogComponent } from '../scheme-warning-dialog/scheme-warning-dialog.component';
import { RegexDialogComponent } from '@b2b/shared/dialogs';

interface ItemModel {
  pos: number;
  title: string;
  ctrlName: string;
  hidden: boolean;
  isCategory?: boolean;
  required?: boolean;
}

const BASE_MODEL: ItemModel[] = [
  { pos: 0, hidden: false, title: 'Категории товара', ctrlName: 'category', isCategory: true, required: true },
  { pos: 1, hidden: false, title: 'Название En', ctrlName: 'nameEn', required: true },
  { pos: 2, hidden: false, title: 'Название Ru', ctrlName: 'nameRu', required: false },
  { pos: 3, hidden: false, title: 'Название Cn', ctrlName: 'nameCn', required: false },
  { pos: 4, hidden: false, title: 'Модель En', ctrlName: 'productModelEn', required: true },
  { pos: 5, hidden: false, title: 'Модель Ru', ctrlName: 'productModelRu', required: false },
  { pos: 6, hidden: false, title: 'Модель Cn', ctrlName: 'productModelCn', required: false },
  { pos: 7, hidden: false, title: 'Артикул', ctrlName: 'articleCode', required: true },
  { pos: 8, hidden: false, title: 'Фотографии', ctrlName: 'image', required: false },
  { pos: 9, hidden: false, title: 'Название фабрики Еn', ctrlName: 'productManufacturerEn', required: true },
  { pos: 10, hidden: false, title: 'Название фабрики Ru', ctrlName: 'productManufacturerRu', required: false },
  { pos: 11, hidden: false, title: 'Название фабрики Cn', ctrlName: 'productManufacturerCn', required: false },
  { pos: 12, hidden: false, title: 'Вес нетто', ctrlName: 'net', required: false },
  { pos: 13, hidden: false, title: 'Вес брутто', ctrlName: 'gross', required: false },
  { pos: 14, hidden: false, title: 'Объем', ctrlName: 'volume', required: false },
  { pos: 15, hidden: false, title: 'Цена', ctrlName: 'price', required: true },
];

@Component({
  selector: 'b2b-scheme-tab-prop',
  templateUrl: './scheme-tab-prop.component.html',
  styleUrls: ['./scheme-tab-prop.component.scss']
})
export class SchemeTabPropComponent implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() categoriesFormArray: FormArray;
  @Input() fields: any;

  dataSource: ItemModel[] = [];
  selectedChar = new FormControl(null);
  selectedCategory: any;

  allStatsSelected: boolean;

  private _fieldsStat: string[] = [];
  private _valuesStat: string[] = [];

  constructor(
    private _matDialog: MatDialog,
    private _categoryService: CategoryService,
    private _fb: FormBuilder) {
    this.dataSource = [...BASE_MODEL];
  }

  get filteredBase(): ItemModel[] {
    return this.dataSource.filter((item) => item.hidden);
  }

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

  onRadioChange(type, item) {
    if (type === 1) {
      this.formGroup.get(`${item.ctrlName}.column`).enable();
      this.formGroup.get(`${item.ctrlName}.value`).disable();
      this.formGroup.get(`${item.ctrlName}.regex`).disable();
      if (item.ctrlName === 'category') {
        this.categoriesFormArray.disable();
      }
    } else if (type === 2) {
      this.formGroup.get(`${item.ctrlName}.value`).enable();
      this.formGroup.get(`${item.ctrlName}.regex`).disable();
      this.formGroup.get(`${item.ctrlName}.column`).setValue(null);
      this.formGroup.get(`${item.ctrlName}.column`).disable();
      if (item.ctrlName === 'category') {
        this.categoriesFormArray.disable();
      }
    } else if (type === 3) {
      this.formGroup.get(`${item.ctrlName}.column`).enable();
      this.formGroup.get(`${item.ctrlName}.regex`).enable();
      this.formGroup.get(`${item.ctrlName}.value`).disable();
      if (item.ctrlName === 'category') {
        this.categoriesFormArray.disable();
      }
    }
  }

  addRow() {
    if (this.selectedChar.value) {
      const prop: any = this.dataSource.find((item) => item.pos === this.selectedChar.value);
      prop['hidden'] = false;
      this.selectedChar.setValue(this.filteredBase[0] && this.filteredBase[0].pos);
    }
  }

  deleteRow(row: ItemModel) {
    row.hidden = true;
    this.selectedChar.setValue(row.pos);
  }

  selectCategory() {
    this._matDialog.open(TreeComponent, {
      width: '800px',
      data: {
        multiple: false
      }
    }).afterClosed().subscribe((res) => {
      this.selectedCategory = res;
      this.formGroup.get(`category.value`).setValue(this.selectedCategory && this.selectedCategory.id);
    });
  }

  selectCategoryForArray(category) {
    this._matDialog.open(TreeComponent, {
      width: '800px',
      data: {
        multiple: false
      }
    }).afterClosed().subscribe((res) => {
      category.get('value').setValue(res);
    });
  }

  addCategoryToArray() {
    this.categoriesFormArray.push(this._fb.group({
      value: this._fb.control({ value: null, disabled: false }, (Validators.required)),
      from: this._fb.control({ value: null, disabled: false }, (Validators.required)),
      to: this._fb.control({ value: null, disabled: false }, (Validators.required))
    }));
  }

  deleteCategoryForArray(index) {
    this.categoriesFormArray.removeAt(index);
  }

  ngOnInit() {
    if (this.fields && this.fields.category && this.fields.category.value) {
      this._categoryService.getCategoryById(this.fields.category.value).subscribe((res) => {
        this.selectedCategory = res;
      });
    }

    this.dataSource.forEach((item) => {
      const field = this.getFieldValue(item.ctrlName);
      const type = item.ctrlName === 'category' && !field.column && !field.value ? 4 : field.type || 1;

      this.formGroup.addControl(`${item.ctrlName}`, this._fb.group({
        type,
        subType: (field.column && field.name) || !field.column ? 1 : 2,
        name: [{ value: field.name || null, disabled: false }],
        column: [{ value: { column: field.column, name: field.name } || null, disabled: false }, false],
        value: [{ value: field.value || null, disabled: type !== 2 }, false],
        regex: [{ value: field.regex || null, disabled: type !== 3 }, false],
        rules: [{ value: field.rules || [], disabled: false }, false],
        collectStats: [{ value: false, disabled: !field.column || type === 2 || type === 4 }, false]
      }));
      this.formGroup.get(`${item.ctrlName}.column`).valueChanges.subscribe(value => {
        if (value) {
          this.formGroup.get(`${item.ctrlName}.collectStats`).enable();
        } else {
          this.formGroup.get(`${item.ctrlName}.collectStats`).disable();
        }
      });
    });
  }

  getFieldValue(ctrl: string) {
    if (this.fields && this.fields[ctrl]) {
      const { name, column, value, regex } = this.fields[ctrl];
      const rules = this.fields[ctrl].rules;
      const type = value ? 2 : regex ? 3 : 1;

      return {
        type,
        name: name || null,
        column: column || null,
        value: value || null,
        regex: regex || null,
        rules: rules || []
      };
    }

    return { type: 1, name: null, column: null, value: null, regex: null, rules: [] };
  }

  changeStrategyWarning(type, item) {
    if (this.formGroup.get(`${item.ctrlName}.type`).value !== type) {
      this._matDialog.open(SchemeWarningDialogComponent, {
        width: '560px',
        data: {}
      }).afterClosed().subscribe(data => {
        if (data) {
          this.changeStrategy(type, item);
        }
      });
    }
  }

  changeStrategy(type, item) {
    this.formGroup.get(`${item.ctrlName}.type`).setValue(type);
    if (type === 1) {
      this.formGroup.get(`${item.ctrlName}.column`).enable();
      this.formGroup.get(`${item.ctrlName}.value`).disable();
      this.formGroup.get(`${item.ctrlName}.regex`).disable();
      if (item.ctrlName === 'category') {
        this.categoriesFormArray.disable();
      }
    } else if (type === 4) {
      this.formGroup.get(`${item.ctrlName}.column`).setValue(null);
      this.formGroup.get(`${item.ctrlName}.column`).disable();
      this.formGroup.get(`${item.ctrlName}.value`).disable();
      this.formGroup.get(`${item.ctrlName}.regex`).disable();
      if (item.ctrlName === 'category') {
        this.categoriesFormArray.enable();
      }
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

  collectStatsChange(event) {
    if (!event.checked) {
      this.allStatsSelected = false;
    } else {
      this.allStatsSelected = true;
      this.dataSource.forEach((item) => {
        if (!this.formGroup.get(`${item.ctrlName}.collectStats`).value) {
          this.allStatsSelected = false;
        }
      });
    }
  }

  collectAllStats(event) {
    this.dataSource.forEach((item) => {
      this.formGroup.get(`${item.ctrlName}.collectStats`).setValue(event.checked);
    });
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
        control.get('regex').setValue(res.regex && res.regex.length ? res.regex : null);
        control.get('rules').setValue(res.rules);
      }
    });
  }
}
