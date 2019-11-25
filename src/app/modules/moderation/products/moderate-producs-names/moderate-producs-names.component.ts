import { Component, OnInit } from '@angular/core';
import { CategoryService } from '@b2b/services/category.service';
import { first, take, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import { ImportModerates } from '@b2b/models/import-moderates';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialog, MatSelectChange, PageEvent } from '@angular/material';
import {
  OverritePropertyDialogComponent
} from '../unmoderated-properties-list/moderate-property-dialog/overrite-property-dialog/overrite-property-dialog.component';
import { ConfigService } from '@b2b/services/config.service';
import { CategoryFeatureDialogComponent } from '@b2b/shared/components/category-feature-dialog/category-feature-dialog.component';
import { CategoryPropertySummary } from '../models/category-summary';
import { ConfirmPopupComponent } from '@b2b/shared/dialogs/confirm-popup/confirm-popup.component';
import { ModerateDialogComponent } from '../unmoderated-categories-list/moderate-dialog/moderate-dialog.component';
import { Observable, of } from 'rxjs';
import { ProductsService } from '@b2b/services/products.service';

@Component({
  selector: 'b2b-moderate-producs-names',
  templateUrl: './moderate-producs-names.component.html',
  styleUrls: ['./moderate-producs-names.component.scss']
})

export class ModerateProducsNamesComponent implements OnInit {
  data: ImportModerates[] = [];
  selectedProducts: ImportModerates[] = [];
  disableSelect = false;
  currentCategory: number; // id выбранной каьтегории, чтобы не были выбраны продукты из разных категорий | selectedProducts[0].categoryId
  nameExample: string[] = [];
  nameExampleReversed: string[] = [];
  action = '';
  pager: PageEvent = {
    length: 0,
    pageIndex: 0,
    pageSize: 0
  };
  totalPages = 0;
  limit = 25;
  loading: boolean;
  properties: string;
  isByName = false;
  productName: string;
  regexForm: FormGroup;
  moderateStatus = 0;
  regex = '';
  fullRegex = '';
  searchedImportModerateProducts: number[] = [];
  searchedProductsCount = 0;
  selectedFeeds: number[] = [];
  selectedCategory: number;
  feeds: any[] = [];
  categories: any[] = [];
  newCategory: any;

  constructor(
    private _categoryService: CategoryService,
    private _productsService: ProductsService,
    private _fb: FormBuilder,
    private _dialog: MatDialog,
    private _config: ConfigService
  ) { }

  ngOnInit() {
    this.getCategoriesList();
    this.getFeeds();
    this.initForm();
    this.getUnmoderatedProductsNames();
  }

  onStatusChanged() {
    this.getUnmoderatedProductsNames();
  }

  isDisabled(feed: number): boolean {
    return this.isByName && !!this.selectedFeeds.length && !this.selectedFeeds.includes(feed);
  }

  initForm() {
    this.searchedImportModerateProducts = [];
    this.regexForm = this._fb.group({
      arr: this._fb.array([
        this._getRegexRow()
      ])
    });
    this.regexForm.valueChanges.pipe(
      distinctUntilChanged(),
      filter(() => this.regexForm.valid)
    ).subscribe(val => {
      this.regex = '';
      this.fullRegex = '/';

      val.arr.forEach((regExEl, i) => {
        let partFullRegex = '';
        if (regExEl.skip) {
          partFullRegex += `(?<skip${i}>`;
        }
        if (!regExEl.skip && !regExEl.isSeparator) {
          partFullRegex += `(?<prop${+(regExEl.property && regExEl.property.id)}>`;
        }

        regExEl.rules.forEach((ruleEl) => {
          if (regExEl.isSeparator) {
            this.regex += `\\${(regExEl.separator === ' ') ? 's+' : regExEl.separator}`;
            partFullRegex += `\\${(regExEl.separator === ' ') ? 's+' : regExEl.separator}`;
          } else {
            if (ruleEl.rule === 'symbol') {
              this.regex += `\\${ruleEl.symbol}`;
              partFullRegex += `\\${ruleEl.symbol}`;
            } else {
              this.regex += `${ruleEl.rule}`;
              partFullRegex += `${ruleEl.rule}`;
            }
          }
        });

        if (regExEl.skip || !regExEl.isSeparator) {
          this.fullRegex += `${partFullRegex})`;
        } else {
          this.fullRegex += `${partFullRegex}`;
        }
      });
      this.fullRegex += '/';
    });
  }

  getFeeds() {
    const query = {
      nonStatus: 5
    };
    this._categoryService.retrieveFeeds(query).subscribe(({ data }) => {
      this.feeds = data;
    });
  }

  onFeedIdChange(evt: MatSelectChange) {
    this.selectedFeeds = evt.value;
    this.getUnmoderatedProductsNames();
  }

  onCategoryChange() {
    this.getUnmoderatedProductsNames();
  }

  private _getRegexRow(): FormGroup {
    return this._fb.group({
      isSeparator: false,
      skip: false,
      // propValue: [{ value: null, disabled: false }, Validators.required],
      property: [{ value: null, disabled: false }, Validators.required],
      separator: [{ value: '', disabled: true }, [Validators.required, Validators.pattern(/[^a-zA-Z0-9]/)]],
      // symbol: [{ value: '', disabled: false }, Validators.required],
      rules: this._fb.array([
        this._getRuleRow()
      ])
    });
  }

  private _getRuleRow(): any {
    return this._fb.group({
      rule: ['[0-9]+', Validators.required], // d - цифры, l -буквы, symbol - символ, который входит в характеристику
      symbol: '',
    });
  }

  /**
   * @param i индекс части регулярки (столбцы)
   */
  onAddNewRuleClick(i) {
    const arr = <FormArray>this.regexForm.get('arr')['controls'][i].get('rules');
    arr.push(this._getRuleRow());
  }

  onChangeSep(checked, group: FormGroup) {
    if (checked) {
      group.get('separator').enable();
      group.get('property').disable();
    } else {
      group.get('separator').disable();
      group.get('property').enable();
    }
  }

  onChangeUpdcateCategory(checked: boolean) {
    this.initForm();
    if (checked) {
      this._dialog.open(ModerateDialogComponent, {
        data: {
          isModerateName: true
        }
      }).afterClosed().subscribe((res: any) => {
        if (res) {
          this.newCategory = res;
        } else {
          this.newCategory = null;
        }
      });
    } else {
      this.newCategory = null;
    }
  }

  onChangeForName(value: boolean) {
    if (value) {
      this.properties = null;
    } else {
      this.productName = null;
    }
  }

  onChangeSkip(checked, group: FormGroup) {
    if (checked) {
      group.get('separator').disable();
      group.get('property').disable();
      // group.get('propValue').enable();
    } else {
      this.onChangeSep(group.get('isSeparator').value, group);
    }
  }

  trackByFn(index, item) {
    return item && item.id || index;
  }

  onNewPropClick(group: FormGroup, index: number) {
    this._dialog.open(CategoryFeatureDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {
        categoryId: (this.newCategory && +this.newCategory.id) || this.selectedCategory
      }
    }).afterClosed()
      .pipe(
        filter((res) => res && !!res),
        switchMap(res => this._categoryService.addCategoryProperty(res)),
      )
      .subscribe((categoryProperty: CategoryPropertySummary) => {
        const valArr = this.regexForm.value.arr;
        if (valArr.find(el => el.property && (el.property.id === categoryProperty.id))) {
          this._config.showSnackBar$.next({ message: 'Данная характеристика уже выбрана' });
          return;
        }
        group.get('property').setValue(categoryProperty);
      });
  }

  onOverritePropClick(group: FormGroup, index: number) {
    this._dialog.open(OverritePropertyDialogComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: {
        item: this.data[0],
        category: (this.newCategory && +this.newCategory.id) || this.selectedCategory,
        getPropId: true
      }
    }).afterClosed().pipe(take(1))
      .subscribe((overriteProp: CategoryPropertySummary) => {
        const valArr = this.regexForm.get('arr').value;
        if (valArr.find(el => el.property && overriteProp && (el.property.id === overriteProp.id))) {
          this._config.showSnackBar$.next({ message: 'Данная характеристика уже выбрана' });
          return;
        }
        group.get('property').setValue(overriteProp);
      });
  }

  onScroll() {
    if (this.pager.pageIndex < this.totalPages) {
      this.getUnmoderatedProductsNames(++this.pager.pageIndex);
    }
  }

  onAddRegexClick() {
    const arr = <FormArray>this.regexForm.get('arr');
    arr.push(this._getRegexRow());
  }

  onRemoveRegexClick(index) {
    const arr = <FormArray>this.regexForm.get('arr');
    arr.removeAt(index);
  }

  getIdsForModerate() {
    const feeds = this.selectedFeeds.join();
    const body = {
      regex: `${this.regex}$`,
      status: this.moderateStatus || null,
      category: this.selectedCategory,
      feeds
    };

    if (this.isByName) {
      if (!this.selectedFeeds[0] && !this.productName) {
        return null;
      }
      body.regex = `${this.productName.trim()}`;

    } else {
      const re = new RegExp(this.regex + '$', 'i');
      const match = this.properties && this.properties.match(re);
      if (this.regexForm.invalid || !match) {
        this._config.showSnackBar$.next({ message: 'Не верно заполнена форма' });
        return;
      }

      body.regex = `${this.regex}$`;
    }

    this._categoryService.searchImportModerateProducts(body)
      .pipe(first())
      .subscribe((res: { count: number, ids: number[], regex: string }) => {
        this.searchedImportModerateProducts = res.ids;
        this.searchedProductsCount = res.count;
        this.selectedProducts = this.data.filter((el, i) => res.ids.includes(el.id));
      });
  }

  get productNameRequestLink(): Observable<any> {
    switch (this.action) {
      case 'model':
        return this._findOrCreateProductModel(this.productName).pipe(
          switchMap((res) => {
            if (res) {
              return this._categoryService.moderateFeedFieldsByName({
                feedId: this.selectedFeeds[0],
                ids: this.searchedImportModerateProducts,
                modelId: res.id
              });
            }
          }));
      case 'brand':
        return this._findOrCreateProductManufacturer(this.productName.trim()).pipe(
          switchMap((res) => {
            if (res) {
              return this._categoryService.moderateFeedFieldsByName({
                feedId: this.selectedFeeds[0],
                ids: this.searchedImportModerateProducts,
                productManufacturerId: res.id
              });
            }
          }));
      default:
        return this._categoryService.moveProductsToCategory({
          categoryId: +this.newCategory.id,
          feedId: this.selectedFeeds[0],
          name: this.productName
        });
    }
  }

  confirmModerate() {
    let requestLink;
    if (!this.isByName) {
      const re = new RegExp(this.regex, 'i');
      const match = this.properties && this.properties.match(re);
      if (this.regexForm.invalid || !match) {
        this._config.showSnackBar$.next({ message: 'Не верно заполнена форма' });
        return;
      }

      requestLink = this._categoryService.moderateProductName({
        ids: this.searchedImportModerateProducts,
        regex: this.fullRegex,
        category: this.newCategory && +this.newCategory.id || null
      });
    } else {
      if (!this.action && !this.newCategory) {
        return;
      }
      requestLink = this.productNameRequestLink;
    }

    requestLink.pipe(
      switchMap(() => {
        return this._dialog.open(ConfirmPopupComponent, {
          data: {
            title: 'Товары отмодерированы'
          }
        }).afterClosed();
      })
    ).subscribe(() => {
      this.searchedImportModerateProducts = [];
      this.regexForm = this._fb.group({
        arr: this._fb.array([
          this._getRegexRow()
        ])
      });
      this.properties = null;
      this.productName = null;
      this.action = '';
      this.data = [];
      this.getUnmoderatedProductsNames();
    });
  }

  onRemoveRuleClick(i, j) {
    const arr = <FormArray>this.regexForm.get('arr')['controls'][i].get('rules');
    arr.removeAt(j);
  }

  private getCategoriesList() {
    this._categoryService.getModerateCategories()
      .subscribe((res: any[]) => {
        this.categories = res;
        // this.selectedCategory = this.categories.length && this.categories[0].id;
      });
  }

  private getUnmoderatedProductsNames(page = 1) {
    this.loading = true;
    const query = {
      type: 7,
      status: this.moderateStatus || [1, 3],
      feeds: this.selectedFeeds,
      category: this.selectedCategory,
      page
    };

    this._categoryService.getUnmoderatedCategories(query).pipe(first())
      .subscribe(({ pager, data }) => {
        this.totalPages = pager.totalPages;
        this.pager = {
          pageSize: pager.perPage,
          length: pager.totalItems,
          pageIndex: pager.currentPage
        };
        this.loading = false;
        if (page === 1) {
          this.data = data;
        } else {
          this.data = [...this.data, ...data];
        }

        if (this.searchedImportModerateProducts.length) {
          this.selectedProducts = [...this.data.filter((el, i) => this.searchedImportModerateProducts.includes(el.id))];
        }
      }, () => this.loading = false);
  }

  private _findOrCreateProductModel(value: string): Observable<any> {
    return this._productsService.getProductModelByName(value)
      .pipe(
        switchMap((founded) => {
          if (founded) {
            return of(founded);
          }
          return this._productsService.addProductModel({
            nameEn: value,
            nameRu: value,
            nameCn: value
          });
        })
      );
  }

  private _findOrCreateProductManufacturer(value: string): Observable<any> {
    return this._productsService.getProductManufacturer(this.selectedCategory, value)
      .pipe(
        switchMap((founded) => {
          if (founded) {
            return of(founded);
          }
          return this._productsService.addProductManufacturer({
            category: this.selectedCategory,
            nameEn: value,
            nameRu: value,
            nameCn: value
          });
        })
      );
  }
}
