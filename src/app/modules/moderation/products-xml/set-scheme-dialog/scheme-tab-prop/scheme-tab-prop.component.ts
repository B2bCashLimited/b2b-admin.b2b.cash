import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { TreeComponent } from '@b2b/shared/modules/tree/tree.component';
import { CategoryService } from '@b2b/services/category.service';
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
  { pos: 0, hidden: false, title: 'Категория', ctrlName: 'category', isCategory: true, required: true },
  { pos: 1, hidden: false, title: 'Название En', ctrlName: 'nameEn', required: true },
  { pos: 2, hidden: false, title: 'Название Ru', ctrlName: 'nameRu', required: false },
  { pos: 3, hidden: false, title: 'Название Cn', ctrlName: 'nameCn', required: false },
  { pos: 4, hidden: false, title: 'Модель En', ctrlName: 'productModelEn', required: true },
  { pos: 5, hidden: false, title: 'Модель Ru', ctrlName: 'productModelRu', required: false },
  { pos: 6, hidden: false, title: 'Модель Cn', ctrlName: 'productModelCn', required: false },
  { pos: 7, hidden: false, title: 'Фотографии', ctrlName: 'image', required: true },
  { pos: 8, hidden: false, title: 'Название фабрики Еn', ctrlName: 'productManufacturerEn', required: true },
  { pos: 9, hidden: false, title: 'Название фабрики Ru', ctrlName: 'productManufacturerRu', required: false },
  { pos: 10, hidden: false, title: 'Название фабрики Cn', ctrlName: 'productManufacturerCn', required: false },
  { pos: 11, hidden: false, title: 'Вес нетто', ctrlName: 'net', required: false },
  { pos: 12, hidden: false, title: 'Вес брутто', ctrlName: 'gross', required: false },
  { pos: 13, hidden: false, title: 'Объем', ctrlName: 'volume', required: false },
  { pos: 14, hidden: false, title: 'Цена', ctrlName: 'price', required: true }
];

@Component({
  selector: 'b2b-scheme-tab-prop',
  templateUrl: './scheme-tab-prop.component.html',
  styleUrls: ['./scheme-tab-prop.component.scss']
})
export class SchemeTabPropComponent implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() formCtrl: FormControl;
  @Input() fields: any;

  dataSource: ItemModel[] = [];
  selectedChar = new FormControl(null);
  selectedCategory: any;
  allStatsSelected: boolean;

  // private _fieldsStat: string[] = [];
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

  get valuesStat(): string[] {
    return this._valuesStat;
  }

  @Input() set valuesStat(values: string[]) {
    this._valuesStat = values;
  }

  onRadioChange(type, item) {
    if (type === 1) {
      this.formGroup.get(`${item.ctrlName}.path`).enable();
      this.formGroup.get(`${item.ctrlName}.value`).disable();
      this.formGroup.get(`${item.ctrlName}.regex`).disable();
    } else if (type === 2) {
      this.formGroup.get(`${item.ctrlName}.value`).enable();
      this.formGroup.get(`${item.ctrlName}.regex`).disable();
      this.formGroup.get(`${item.ctrlName}.path`).setValue(null);
      this.formGroup.get(`${item.ctrlName}.path`).disable();
    } else if (type === 3) {
      this.formGroup.get(`${item.ctrlName}.path`).enable();
      this.formGroup.get(`${item.ctrlName}.regex`).enable();
      this.formGroup.get(`${item.ctrlName}.value`).disable();
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

  ngOnInit() {
    if (this.fields && this.fields.category && this.fields.category.value) {
      this._categoryService.getCategoryById(this.fields.category.value['ru']).subscribe((res) => {
        this.selectedCategory = res;
      });
    }

    this.dataSource.forEach((item) => {
      const field = this.getFieldValue(item.ctrlName);
      this.formGroup.addControl(`${item.ctrlName}`, this._fb.group({
        type: field.type || 1,
        path: [{ value: field.path || null, disabled: false }, (item.required && Validators.required)],
        value: [{ value: field.value || null, disabled: item.required }, (item.required && Validators.required)],
        regex: [{ value: field.regex || null, disabled: item.required }, (item.required && Validators.required)],
        rules: [{ value: field.rules || [], disabled: false }, false],
        collectStats: [{ value: false, disabled: !field.path }, false]
      }));

      this.formGroup.get(`${item.ctrlName}.path`).valueChanges.subscribe(value => {
        if (value) {
          this.formGroup.get(`${item.ctrlName}.collectStats`).enable();
        } else {
          this.formGroup.get(`${item.ctrlName}.collectStats`).disable();
        }
      });
    });
  }

  changeColumnValue(event, item) {
    this.formGroup.get(`${item.ctrlName}.path`).setValue(event.target.value);
    if (event.target.value) {
      this.formGroup.get(`${item.ctrlName}.collectStats`).enable();
    } else {
      this.formGroup.get(`${item.ctrlName}.collectStats`).disable();
    }
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

  getFieldValue(ctrl: string) {
    if (this.fields && this.fields[ctrl]) {
      const { path, value, regex } = this.fields[ctrl];
      const rules = this.fields[ctrl].rules;
      const type = value ? 2 : regex ? 3 : 1;

      return {
        type,
        path: path || null,
        value: value || null,
        regex: regex || null,
        rules: rules || []
      };
    }

    return { type: 1, path: null, value: null, regex: null, rules: [] };
  }

  openRegexEdit(control) {
    const path = control.get('path').value || null;
    const rules = control.get('rules').value;

    console.log(this.valuesStat, 'this.valuesStat');

    this._matDialog.open(RegexDialogComponent, {
      width: '1150px',
      data: {
        rules,
        valuesStat: path && this.valuesStat[path] ? Object.keys(this.valuesStat[path]) : []
      }
    }).afterClosed().subscribe((res) => {
      console.log(res, 'ressss');

      if (res) {
        control.get('regex').setValue(res.regex && res.regex.length ? res.regex : null);
        control.get('rules').setValue(res.rules);
      }
    });
  }
}
