import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CategoryService } from '@b2b/services/category.service';
import { MatTableDataSource } from '@angular/material';
import { orderBy } from 'lodash';
import { FEED_PROCESS_TYPES } from 'app/core/enums/feed';

@Component({
  selector: 'b2b-set-scheme-dialog',
  templateUrl: './set-scheme-dialog.component.html',
  styleUrls: ['./set-scheme-dialog.component.scss']
})
export class SetSchemeDialogComponent implements OnInit {
  formGroup: FormGroup;
  selectedSchemeIndex = 0;
  selectedIndex = 0;
  displayedColumnsByValue: string[] = ['value', 'count'];
  dataSourceForValue: any[] = [];
  fieldsStat;
  productsStat;
  valuesStat;
  fields: any = {};

  categoriesValues = [];

  constructor(
    private _categoryService: CategoryService,
    private _dialogRef: MatDialogRef<SetSchemeDialogComponent>,
    private _fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.fieldsStat = this.data.fieldsStat || [];
    this.productsStat = this.data.productsStat || [];
    this.valuesStat = this.data.valuesStat;
  }

  structureGroup(scheme?): FormGroup {
    const group = this._fb.group({
      element: [scheme.element || 'xls', Validators.required],
      fields: this._fb.group({}),
      categories: this._fb.group({
        data: this._fb.array([])
      }),
      extCategories: this._fb.array([]),
      dictionaries: this._fb.group({})
    });

    if (this.data.structure && this.data.structure.categories &&
        this.data.structure.categories.data && this.data.structure.categories.data.length) {
      this.data.structure.categories.data.forEach((category, i) => {
        (group.get('categories.data') as FormArray).push(this._fb.group({
          value: this._fb.control({ value: category.value, disabled: false }, (Validators.required)),
          from: this._fb.control({ value: category.from, disabled: false }, (Validators.required)),
          to: this._fb.control({ value: category.to, disabled: false }, (Validators.required))
        }));

        this.pushToExtCategories(category.value, group, i);
      });
    }

    if (this.data.structure && this.data.structure.fields && this.data.structure.fields.category
        && this.data.structure.fields.category.value) {
      this.pushToExtCategories({ id: this.data.structure.fields.category.value }, group, 0);
    }

    this.categoriesValues = [];
    if (this.valuesStat && this.data.structure && this.data.structure.fields &&
        this.data.structure.fields.category && this.data.structure.fields.category.column) {
      const valueStatKey = Object.keys(this.valuesStat).find(key => key === this.data.structure.fields.category.column);
      const categoriesValuesTemp = valueStatKey ? Object.keys(this.valuesStat[valueStatKey]) : [];

      if (this.data.structure._extCategories && this.data.structure._extCategories.length) {
        this.data.structure._extCategories.sort((a, b) => a.position - b.position).forEach(category => {
          const catValue = categoriesValuesTemp.find(cat => cat === category.value);

          if (catValue) {
            this.categoriesValues.push(catValue);
          }
        });
        this.categoriesValues = Array.from(new Set(this.categoriesValues.concat(categoriesValuesTemp)));
      } else {
        this.categoriesValues = categoriesValuesTemp;
      }

      this.categoriesValues.forEach((category, i) => {
        this.pushToExtCategories(category, group, i, true);
      });
    }

    if (this.data.structure && this.data.structure._extDictionaries) {
      Object.keys(this.data.structure._extDictionaries).forEach(key => {
        (group.get('dictionaries') as FormGroup).addControl(key, this._fb.group({
          type: this.data.structure._extDictionaries[key].type,
          field: this.data.structure._extDictionaries[key].field,
          valueStat: this.data.structure._extDictionaries[key].valueStat,
          category: this.data.structure._extDictionaries[key].category,
          categoryObject: this.data.structure._extDictionaries[key].categoryObject,
          prop: this.data.structure._extDictionaries[key].prop,
          propObject: this.data.structure._extDictionaries[key].propObject,
          value: this.data.structure._extDictionaries[key].value,
          posValue: this.data.structure._extDictionaries[key].posValue,
          posValueObject: this.data.structure._extDictionaries[key].posValueObject
        }));
      });
    }

    return group;
  }

  pushToExtCategories(category, group, i: number, valueStat = false) {
    if (this.data.structure._extCategories && this.data.structure._extCategories.length) {
      const extCategory = valueStat ? this.data.structure._extCategories.find(extCat => extCat.value === category) :
                                      this.data.structure._extCategories.find(extCat => extCat.value.id === category.id);

      if (extCategory) {
        (group.get('extCategories') as FormArray).push(this._fb.group({
          position: extCategory.position || (i + 1),
          valueStat: valueStat,
          value: this._fb.control({ value: extCategory.value, disabled: false }),
          category: this._fb.control({ value: extCategory.category, disabled: false }),
          properties: this._fb.array(extCategory.properties.map(property => {
            const type = property.value ? 2 : property.regex ? 3 : 1;
            return this._fb.group({
              type,
              subType: property.subType || 1,
              prop: property.prop,
              propObj: property.propObj,
              column: property.column,
              value: property.value,
              regex: property.regex,
              collectStats: [{ value: false, disabled: type === 2 }, false],
              rules: [{ value: property.rules || [], disabled: false }, false],
              missing: property.missing
            });
          }))
        }));
      } else {
        (group.get('extCategories') as FormArray).push(this._fb.group({
          position: i + 1,
          valueStat: valueStat,
          value: this._fb.control({ value: category, disabled: false }),
          category: this._fb.control({ value: valueStat ? null : category, disabled: false }),
          properties: this._fb.array([])
        }));
      }
    } else {
      (group.get('extCategories') as FormArray).push(this._fb.group({
        position: i + 1,
        valueStat: valueStat,
        value: this._fb.control({ value: category, disabled: false }),
        category: this._fb.control({ value: valueStat ? null : category, disabled: false }),
        properties: this._fb.array([])
      }));
    }
  }

  fieldsValue(elem?): any {
    return this.data.structure && elem ? this.data.structure.fields : null;
  }

  ngOnInit() {
    this.formGroup = this._fb.group({
      structure: this.structureGroup(this.data.structure && !Array.isArray(this.data.structure) ? this.data.structure : {})
    });

    Object.keys(this.valuesStat).forEach((key) => {
      const dataSource = [];
      Object.keys(this.valuesStat[key]).forEach((childKey) => {
        dataSource.push({
          value: childKey,
          count: this.valuesStat[key][childKey]
        });
      });
      this.dataSourceForValue.push({
        header: this.fieldsStat.find(field => field.column === key).name,
        dataSource: new MatTableDataSource(orderBy(dataSource, 'count', 'desc'))
      });
    });
  }

  statisticsByValue() {
    const structure = this.formGroup.get('structure').value;

    const columns = Object.keys(structure.fields).map(key => {
      return structure.fields[key] && structure.fields[key].column &&
             structure.fields[key].column.column && structure.fields[key].collectStats ? structure.fields[key].column.column : null;
    }).filter(column => column);

    structure.extCategories.forEach(category => {
      category.properties.filter(property => property.collectStats && property.column
                                             && property.column.column).forEach(property => {
        columns.push(property.column.column);
      });
    });

    this.addTask(FEED_PROCESS_TYPES.VALUES_STAT_XLS, {
      fields: Array.from(new Set(columns))
    });
  }

  private addTask(type: number, params?: any): void {
    const body: any = {
      type,
      status: 1,
      feed: this.data.feed.id,
      params
    };

    this._categoryService.addTask(body).subscribe();
  }

  onSubmit() {
    if (this.formGroup.invalid) {
      return null;
    }

    const properties: any = {}, dictionaries: any = {};
    const item = this.formGroup.get('structure').value;

    Object.keys(item.dictionaries).forEach((key) => {
      const field = Object.keys(item.fields).find(fieldKey => item.fields[fieldKey].column && item.dictionaries[key].field &&
                                                              item.fields[fieldKey].column.column === item.dictionaries[key].field);
      dictionaries[field] = dictionaries[field] || {};
      if (field && item.dictionaries[key].valueStat && item.dictionaries[key].type === 4) {
        dictionaries[field][item.dictionaries[key].valueStat] = item.dictionaries[key].posValue;
      } else if (field) {
        switch (item.dictionaries[key].type) {
          case 1:
            dictionaries[field][item.fields[field].column.name] = item.dictionaries[key].prop;
            break;
          case 2:
            dictionaries[field][item.fields[field].column.name] = item.dictionaries[key].category;
            break;
          case 3:
            dictionaries[field][item.fields[field].column.name] = item.dictionaries[key].value;
            break;
          case 4:
            dictionaries[field][item.fields[field].column.name] = item.dictionaries[key].posValue;
            break;
        }
      }
    });

    if (item.extCategories.length) {
      item.extCategories.forEach(category => {
        if (category.category) {
          dictionaries.category = dictionaries.category || {};
          dictionaries.category[category.value] = category.category.id;
          category.properties.forEach(property => {
            if (property.prop && !property.missing) {
              properties[property.prop] = {};
              if (property.column) {
                properties[property.prop].column = property.column.column;
              }
              if (property.regex) {
                properties[property.prop].regex = property.regex;
              }
              if (property.value) {
                properties[property.prop].value = property.value;
              }
            }
          });
        }
      });
    }

    const structure = {
      element: item.element,
      fields: {
        category: this.getFieldGroup(item.fields.category),
        nameEn: this.getFieldGroup(item.fields.nameEn),
        nameRu: this.getFieldGroup(item.fields.nameRu),
        nameCn: this.getFieldGroup(item.fields.nameCn),
        image: this.getFieldGroup(item.fields.image),
        productManufacturerEn: this.getFieldGroup(item.fields.productManufacturerEn),
        productManufacturerRu: this.getFieldGroup(item.fields.productManufacturerRu),
        productManufacturerCn: this.getFieldGroup(item.fields.productManufacturerCn),
        productModelEn: this.getFieldGroup(item.fields.productModelEn),
        productModelRu: this.getFieldGroup(item.fields.productModelRu),
        productModelCn: this.getFieldGroup(item.fields.productModelCn),
        articleCode: this.getFieldGroup(item.fields.articleCode),
        price: this.getFieldGroup(item.fields.price),
        net: this.getFieldGroup(item.fields.net),
        gross: this.getFieldGroup(item.fields.gross),
        volume: this.getFieldGroup(item.fields.volume),
      },
      categories: item.categories || {},
      properties,
      dictionaries,
      _extCategories: item.extCategories,
      _extDictionaries: item.dictionaries
    };

    this._categoryService.updateFeed(this.data.feed.id, { structure }).subscribe((data) => this._dialogRef.close(data));
  }

  private getFieldGroup(group: any): any {
    if (!group.column && group.type !== 2) {
      return null;
    }
    if (group.type === 1) {
      return {
        name: group.column.name,
        column: group.column.column
      };
    } else if (group.type === 2) {
      return {
        value: group.value
      };
    } else if (group.type === 3) {
      return {
        name: group.column.name,
        column: group.column.column,
        regex: group.regex,
        rules: group.rules
      };
    }

    return null;
  }
}
