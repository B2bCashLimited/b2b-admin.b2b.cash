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
  displayedColumnsByFields: string[] = ['field', 'count'];
  // dataSourceForFields: MatTableDataSource<any>;
  displayedColumnsByValue: string[] = ['value', 'count'];
  dataSourceForValue: any[] = [];
  fieldsStat;
  valuesStat;
  fields: any = {};

  constructor(
    private _categoryService: CategoryService,
    private _dialogRef: MatDialogRef<SetSchemeDialogComponent>,
    private _fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.fieldsStat = this.data.fieldsStat || [];
    this.valuesStat = this.data.valuesStat;
  }

  addNewScheme(elem?) {
    const structureArr = <FormArray>this.formGroup.get('structure');
    structureArr.push(this.structureGroup(elem));
  }

  structureGroup(elem?): FormGroup {
    return this._fb.group({
      element: [elem || '', Validators.required],
      fields: this._fb.group({}),
      properties: this._fb.group({}),
      dictionaries: this._fb.group({})
    });
  }

  fieldsValue(elem?): any {
    if (this.data.structure && this.data.structure.length && elem) {
      const schema = this.data.structure.find((scheme) => scheme.element === elem);
      return  schema && schema.fields || null;
    }
    return null;
  }

  ngOnInit() {
    this.formGroup = this._fb.group({
      structure: this._fb.array([])
    });

    if (this.data.structure && Array.isArray(this.data.structure) && this.data.structure.length) {
      this.data.structure.forEach(scheme => {
        this.addNewScheme(scheme.element);
      });
    } else {
      this.addNewScheme();
    }

    // const fieldsStat = Object.keys(this.fieldsStat).map((key) => {
    //   return {
    //     field: key,
    //     count: this.fieldsStat[key]
    //   };
    // });
    console.log(this.valuesStat, 'this.valuesStat');

    Object.keys(this.valuesStat).forEach((key) => {
      const dataSource = [];
      Object.keys(this.valuesStat[key]).forEach((childKey) => {
        dataSource.push({
          value: childKey,
          count: this.valuesStat[key][childKey]
        });
      });
      this.dataSourceForValue.push({
        header: key,
        dataSource: new MatTableDataSource(orderBy(dataSource, 'count', 'desc'))
      });
    });
  }

  statisticsByValue() {
    const structure = (<FormArray>this.formGroup.get('structure')).at(this.selectedIndex).value;

    console.log(structure.fields, 'structure');



    const fields = Object.keys(structure.fields).map(key => {
      console.log(key);

      return structure.fields[key] && structure.fields[key].collectStats
        && structure.fields[key].path || null;
    }).filter(column => column);

    // structure.extCategories.forEach(category => {
    //   category.properties.filter(property => property.collectStats && property.column
    //                                          && property.column.column).forEach(property => {
    //     fields.push(property.column.column);
    //   });
    // });

    this.addTask(FEED_PROCESS_TYPES.VALUES_STAT, {
      fields: Array.from(new Set(fields))
    });


    console.log(fields, 'this.fields');

    console.log(this.formGroup, 'this.formGroup');


    // this.addTask(FEED_PROCESS_TYPES.VALUES_STAT, {
    //   fields: Object.keys(this.fields).filter((key) => this.fields[key])
    // });
  }

  deleteTab(index: number) {
    const arr = <FormArray>this.formGroup.get('structure');

    arr.removeAt(index);
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

    const structure = this.formGroup.get('structure').value.map((item) => {
      const properties: any = {}, dictionaries: any = {};
      Object.keys(item.properties).forEach((key) => {
        properties[item.properties[key]['prop']] = this.getFieldGroup(item.properties[key]);
      });

      Object.keys(item.dictionaries).forEach((key) => {
        switch (item.dictionaries[key].type) {
          case 1:
            dictionaries[item.dictionaries[key]['category']] = {
              [item.dictionaries[key]['field']]: item.dictionaries[key]['propObject']
            };
            break;
          case 2:
            dictionaries.category[item.dictionaries[key]['field']] = item.dictionaries[key]['category'];
            break;
          case 3:
            dictionaries[item.dictionaries[key]['field']] = item.dictionaries[key]['value'];
            break;
          case 4:
            dictionaries[item.dictionaries[key]['category']] = {
              [item.dictionaries[key]['field']]: item.dictionaries[key]['posValueObject']
            };
            break;
        }
      });

      return {
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
          price: this.getFieldGroup(item.fields.price),
          net: this.getFieldGroup(item.fields.net),
          gross: this.getFieldGroup(item.fields.gross),
          volume: this.getFieldGroup(item.fields.volume),
        },
        properties,
        dictionaries
      };
    });
    this._categoryService.updateFeed(this.data.feed.id, { structure }).subscribe(() => this._dialogRef.close());
  }

  public formData(arr) {
    return <FormArray>arr;
  }

  private getFieldGroup(group: any): any {
    if (group.type === 1) {
      return {
        path: group.path
      };
    } else if (group.type === 2) {
      return {
        value: {
          ru: group.value,
          en: group.value,
          cn: group.value
        }
      };
    } else if (group.type === 3) {
      return {
        path: group.path,
        regex: group.regex
      };
    }

    return null;
  }
}
