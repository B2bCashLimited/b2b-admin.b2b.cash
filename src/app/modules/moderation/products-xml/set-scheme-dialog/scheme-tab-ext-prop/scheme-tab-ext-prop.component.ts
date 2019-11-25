import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { CategoryService } from '@b2b/services/category.service';

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

  @Input() formGroup: FormGroup;
  @Input() categoryCtrl: FormControl;
  categoryProperties = [];
  dictionariesDataSource: any[] = [];
  dataSource: ItemModel[] = [];

  constructor(
    private _categoryService: CategoryService,
    private _fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.categoryCtrl.valueChanges.subscribe((category) => {
      if (category && category.value && category.value['ru']) {
        this._categoryService.getCategoryFeaturesProperties(category.value['ru']).subscribe(({ categoryProperties }) => {
          this.categoryProperties = categoryProperties;
          this.dictionariesDataSource = categoryProperties.filter((item) => item.valueType === 3);
        });
      }
    });
  }

  addRow() {
    if (this.categoryProperties.length) {
      const item = this.categoryProperties[0];
      const length = this.dataSource.length;
      this.dataSource.push({
        pos: length,
        ctrlName: `prop${length}`
      });
      this.formGroup.addControl(`prop${length}`, this._fb.group({
        type: 1,
        prop: item.id,
        path: null,
        value: null,
        regex: null
      }));
    }
  }

  deleteRow(row: ItemModel | any) {
    this.dataSource = this.dataSource.filter((item) => item.pos !== row.pos);
    this.formGroup.removeControl(`${row.ctrlName}`);
  }
}
