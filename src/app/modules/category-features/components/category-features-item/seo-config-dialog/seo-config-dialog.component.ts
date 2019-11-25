import { Component, Inject, OnInit, OnDestroy, ViewChild, QueryList, ViewChildren } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatExpansionPanel, MatSlideToggle, MatSnackBar } from '@angular/material';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { forkJoin, of, Subject, Subscription } from 'rxjs';
import { SeoService } from '@b2b/services/seo.service';
import { catchError, debounceTime, delay, distinctUntilChanged, filter, first, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { CategoryService } from '@b2b/services/category.service';
import { LocationService } from '@b2b/services/location.service';
import { ProductsService } from '@b2b/services/products.service';
import { Observable } from 'rxjs/internal/Observable';
import {
  ConfirmDeleteTemplateComponent
} from '../../../../mailer/templates/templates-index/dialogs/confirm-delete-template/confirm-delete-template.component';

const MARKET_TYPES = {
  TYPE_PRODUCT_FOR_INDIVIDUAL: 1, // Тип маркет для физ лиц
  TYPE_PRODUCT_FOR_COMPANY: 2, // Тип маркет для юр лиц
  TYPE_ORDER_PRODUCT_NEW: 3, // Тип оформить заказ в клик
  TYPE_PRE_ORDER_FROM_CHINA: 4, // Тип предзаказ из Китая
  TYPE_PRODUCT_INFO: 5 // страница товара
};

const Languages = {
  Ru: 'Ru',
  En: 'En',
  Cn: 'Cn',
};

@Component({
  selector: 'b2b-seo-config-dialog',
  templateUrl: './seo-config-dialog.component.html',
  styleUrls: ['./seo-config-dialog.component.scss']
})
export class SeoConfigDialogComponent implements OnInit, OnDestroy {

  @ViewChild('matExpansionPanel') matExpansionPanel: MatExpansionPanel;
  @ViewChildren(MatSlideToggle) matSlideToggleQueryList: QueryList<MatSlideToggle>;

  models$: Observable<{id: number; nameRu: string; nameEn: string; nameCn: string}[]>;
  marketPlaceCtrl = new FormControl(null);
  seoFormGroup: FormGroup;
  propertiesFormGroup: FormGroup;
  formLang = Languages.Ru;
  e_MARKET_TYPES = MARKET_TYPES;
  categoryId: number;
  isEdit = false;
  seoCategoryId: number;
  showPropertiesForm = false;
  properties: any[];
  countries = [];
  manufacturers = [];
  cities = [];
  deliveryAddressCityTypeahead$ = new Subject<string>();
  pending = false;
  flag = true;
  createdRecords = [];
  recordsData = [
    {name: 'h1 RU', value: 'headerNameRu'},
    {name: 'h1 EN', value: 'headerNameEn'},
    {name: 'h1 CN', value: 'headerNameCn'},
    {name: 'title RU', value: 'titleNameRu'},
    {name: 'title EN', value: 'titleNameEn'},
    {name: 'title CN', value: 'titleNameCn'},
    {name: 'keywords RU', value: 'keywordsNameRu'},
    {name: 'keywords EN', value: 'keywordsNameEn'},
    {name: 'keywords CN', value: 'keywordsNameCn'},
    {name: 'metaDesc RU', value: 'metaDescNameRu'},
    {name: 'metaDesc EN', value: 'metaDescNameEn'},
    {name: 'metaDesc CN', value: 'metaDescNameCn'},
    {name: 'textDesc RU', value: 'descriptionNameRu'},
    {name: 'textDesc EN', value: 'descriptionNameEn'},
    {name: 'textDesc CN', value: 'descriptionNameCn'}
  ];

  private _unsubscribe$: Subject<void> = new Subject<void>();
  private _findSeoSub: Subscription;
  private models: any[];

  constructor(
    private _seoService: SeoService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _formBuilder: FormBuilder,
    private _categoryService: CategoryService,
    private _locationService: LocationService,
    private _productsService: ProductsService,
    private _snackBar: MatSnackBar,
    private _matDialog: MatDialog,
  ) {
  }

  ngOnDestroy(): void {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.categoryId = this.data.category.id;
    this._initFormGroup();
    this._categoryService.getMarketFilterCatProps(this.categoryId)
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe(value => {
        this.properties = value;
        this._initPropsFormGroup();
      });
    this.valueChanges();
  }

  changeLang(ev): void {
    switch (ev.index) {
      case 0:
        this.formLang = Languages.Ru;
        break;
      case 1:
        this.formLang = Languages.En;
        break;
      case 2:
        this.formLang = Languages.Cn;
        break;
    }
  }

  valueChanges(): void {
    this.marketPlaceCtrl.valueChanges
      .pipe(
        switchMap(() => {
          this.pending = true;
          this._initFormGroup();
          return forkJoin(
            this.refreshData(),
            this.refreshRecordsList());
        }),
        takeUntil(this._unsubscribe$),
      ).subscribe();
  }

  flexChange(): void {
    this.flag = !this.flag;

    if (this.flag) {
      this.matSlideToggleQueryList.forEach(slide => slide.checked = false);
    }

    for (const key in this.propertiesFormGroup.controls) {
      if (this.propertiesFormGroup.controls.hasOwnProperty(key)) {
        const control = this.propertiesFormGroup.get(key);

        if (this.flag) {
          control.get('allValues').disable();
          control.get('propValue').disable();
        }
      }
    }

    if (this._findSeoSub && !this._findSeoSub.closed) {
      this._findSeoSub.unsubscribe();
    }

    this._findSeoSub = this.refreshData()
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe();
  }

  refreshData(): Observable<any> {
    const props = this.getChosenProps().map(value => {
      const res = {};
      res[`${value.reqName}`] = value.reqVal;
      return res;
    });

    return this._seoService.findSeoMetaData(this.categoryId, +this.marketPlaceCtrl.value, JSON.stringify(props), this.flag)
      .pipe(
        map(res => {
          this.pending = false;
          if (res && res.id) {
            this.seoCategoryId = +res['id'];
            this.isEdit = true;
            this.seoFormGroup.patchValue(res);
          } else {
            this.isEdit = false;
            this.seoCategoryId = 0;
            this.seoFormGroup.reset();
          }
        }),
        catchError(() => of(null)),
        takeUntil(this._unsubscribe$)
      );
  }

  refreshRecordsList(): Observable<any> {
    return this._seoService.getCategoryMetaData(this.data.category.id, this.marketPlaceCtrl.value || 1)
      .pipe(
        map(value1 => {
          if (value1['_embedded'] && value1['_embedded']['seo-category']) {
            this.createdRecords = value1['_embedded']['seo-category'];
            this.createdRecords.forEach(value => {
              if (value.properties.length) {
                value.props = JSON.stringify(value.properties);
                if (value.flexible) {
                  value.props += ' + любые значения остальных';
                }
              } else {
                if (value.flexible) {
                  value.props = 'Любые значения любых характеристик';
                } else {
                  value.props = 'Без выбранных фильтров';
                }
              }
              let data = `h1: \n\tRU: ${value.headerNameRu || ''}\n\tEN: ${value.headerNameEN || ''}\n\tCN: ${value.headerNameCn || ''}\n`;
              data += `title: \n\tRU: ${value.titleNameRu || ''}\n\tEN: ${value.titleNameEn || ''}\n\tCN: ${value.titleNameCn || ''}\n`;
              data += `keywords: \n\tRU: ${value.keywordsNameRu || ''}\n\tEN: ${value.keywordsNameEn || ''}
            \n\tCN: ${value.keywordsNameCn || ''}\n`;
              data += `metaDesc: \n\tRU: ${value.metaDescNameRu || ''}\n\tEN: ${value.metaDescNameEn || ''}
            \n\tCN: ${value.metaDescNameCn || ''}\n`;
              data += `textDesc: \n\tRU: ${value.descriptionNameRu || ''}\n\tEN: ${value.descriptionNameEn || ''}
            \n\tCN: ${value.descriptionNameCn || ''}\n`;
              value.data = data;
            });
          }
        }),
        catchError(() => of(null)),
        takeUntil(this._unsubscribe$),
      );
  }

  togglePropertiesForm(flag?: boolean) {
    if (flag === undefined) {
      this.showPropertiesForm = !this.showPropertiesForm;
    } else {
      this.showPropertiesForm = flag;
    }

    if (this.showPropertiesForm && !this.countries.length) {
      this._locationService.getCountries()
        .pipe(takeUntil(this._unsubscribe$))
        .subscribe(value => this.countries = value);
      this._productsService.getManufacturers(this.categoryId)
        .pipe(takeUntil(this._unsubscribe$))
        .subscribe(value => this.manufacturers = value);
      this.deliveryAddressCityTypeahead$
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          tap(() => this.cities = []),
          filter((str: string) => !!str && str.length > 0),
          switchMap((str: string) => this._locationService.getCities(str, 0)),
          takeUntil(this._unsubscribe$),
        )
        .subscribe(value => this.cities = value);
    }
  }

  decodeMeta(str: string): string {
    const testStr = str || '';
    // const testStr = 'Лучшие <pr>#n#</pr> <pr>#p7909#</pr><pr>/#p7887#</pr> <pr>R#p678#</pr> летние';
    // const testStr = 'Шины летние для автомобилей';
    let foundPos1 = 0;
    let foundPos2 = 0;
    let strArray = [];
    let searchComplete = false;
    while (!searchComplete) {
      const indOfPr1 = testStr.indexOf('<pr>', foundPos1);
      foundPos1 = indOfPr1 + 1;
      if (indOfPr1 === -1) {
        strArray.push(testStr.slice(foundPos2 && (foundPos2 + 4)));
      } else {
        strArray.push(testStr.slice(foundPos2 && (foundPos2 + 4), indOfPr1));
      }
      const indOfPr2 = testStr.indexOf('</pr>', foundPos2);
      foundPos2 = indOfPr2 + 1;
      if (indOfPr1 === -1 && indOfPr2 === -1) {
        searchComplete = true;
      } else {
        strArray.push(testStr.slice(indOfPr1, indOfPr2 + 5));
      }
    }

    strArray = strArray.map((value: string) => {
      if (value.indexOf('<pr>') !== -1) {
        const tag = value.match(/#[a-z0-9]*#/);
        switch (tag && tag[0]) {
          case '#c#':
            return this.getReplacedString(value, '#c#', this.propertiesFormGroup.get('country.propValue').value ?
              this.propertiesFormGroup.get('country.propValue').value['name' + this.formLang] : this.countries[0] ?
                this.countries[0]['name' + this.formLang] : 'Россия');
          case '#city#':
            return this.getReplacedString(value, '#city#', this.propertiesFormGroup.get('city.propValue').value ?
              this.propertiesFormGroup.get('city.propValue').value['name' + this.formLang] : this.cities[0] ?
                this.cities[0]['name' + this.formLang] : 'Москва');
          case '#m#':
            return this.getReplacedString(value, '#m#', this.propertiesFormGroup.get('manufacturer.propValue').value ?
              this.propertiesFormGroup.get('manufacturer.propValue').value['name' + this.formLang] : this.manufacturers[0] ?
                this.manufacturers[0]['name' + this.formLang] : 'Microsoft');
          case '#model#':
            return this.getReplacedString(value, '#model#', this.propertiesFormGroup.get('model.propValue').value ?
              this.propertiesFormGroup.get('model.propValue').value['value'] : this.models[0] ?
                this.models[0]['value'] : 'Microsoft');
          case '#n#':
            return this.getReplacedString(value, '#n#', this.data.category.nameRu);
          case '#h1#':
            return this.getReplacedString(value, '#h1#',
              this.decodeMeta(this.seoFormGroup.get(`header.name${this.formLang}`).value) || '<h1></h1>');
          case '#title#':
            return this.getReplacedString(value, '#title#',
              this.decodeMeta(this.seoFormGroup.get(`title.name${this.formLang}`).value) || '<title></title>');
          case '#prod#':
            return this.getReplacedString(value, '#prod#', 'Название_товара');
          default:
            let propRes = '';
            this.properties.forEach(prop => {
              if (tag && tag[0] === `#p${prop.id}#`) {
                propRes = this.getReplacedString(value, `#p${prop.id}#`, this.propertiesFormGroup.get(`${prop.id}.propValue`).value || 123);
              }
            });
            return propRes;
        }
      } else {
        return value;
      }
    });

    return strArray.join('').trim().replace(/\s+/g, ' ');
  }

  getReplacedString(str: string, tag: string, data: string): string {
    if (data) {
      str = str.slice(4, str.indexOf('</pr>'));
      str = str.replace(tag, data);
    } else {
      str = '';
    }
    return str;
  }

  togglePropEnable(control: FormControl) {
    if (control.enabled) {
      control.disable();
      control.parent.get('allValues').disable();
    } else {
      control.enable();
      control.parent.get('allValues').enable();
    }
  }

  deleteRecord(record): void {
    this._matDialog.open(ConfirmDeleteTemplateComponent, {
      data: {
        header: `Удаление записи ${record.id}?`,
        question: 'Вы уверены?'
      }
    })
      .afterClosed()
      .pipe(
        first(),
        filter(value => !!value),
        switchMap(() => this._seoService.deleteCategoryMetaDataRecord(record.id)),
        switchMap(() => {
          this._snackBar.open('Запись была успешно удалена', 'OK', {
            duration: 3000,
          });

          return forkJoin(this.refreshData(), this.refreshRecordsList());
        }),
        catchError(() => {
          this._snackBar.open('При удалении произошла ошибка!', 'OK', {
            duration: 3000,
          });

          return of(null);
        }),
        takeUntil(this._unsubscribe$)
      )
      .subscribe();
  }

  getChosenProps(): {name: string, value: string | number, reqName: string, reqVal: string | number}[] {
    const chosenPropIds = Object.keys(this.propertiesFormGroup.controls).filter(value => {
      return this.propertiesFormGroup.get(value).enabled;
    });
    return chosenPropIds.map(value => {
      const fullProp = this.properties.find(value1 => +value1.id === +value);
      if (!fullProp) {  // если страна или производитель
        if (value === 'country') {
          const val = this.propertiesFormGroup.get('country.allValues').value ?
            'все значения' : this.propertiesFormGroup.get('country.propValue').value
              ? this.propertiesFormGroup.get('country.propValue').value.nameRu : '';
          const reqVal = this.propertiesFormGroup.get('country.allValues').value ?
            '#all#' : this.propertiesFormGroup.get('country.propValue').value
              ? this.propertiesFormGroup.get('country.propValue').value.nameRu : '';
          return {name: 'Страна', value: val, reqName: 'country', reqVal: reqVal};
        }
        if (value === 'city') {
          const val = this.propertiesFormGroup.get('city.allValues').value ?
            'все значения' : this.propertiesFormGroup.get('city.propValue').value
              ? this.propertiesFormGroup.get('city.propValue').value.nameRu : '';
          const reqVal = this.propertiesFormGroup.get('city.allValues').value ?
            '#all#' : this.propertiesFormGroup.get('city.propValue').value
              ? +this.propertiesFormGroup.get('city.propValue').value.id : '';
          return {name: 'Город', value: val, reqName: 'city', reqVal: reqVal};
        }
        if (value === 'manufacturer') {
          const val = this.propertiesFormGroup.get('manufacturer.allValues').value ?
            'все значения' :
            this.propertiesFormGroup.get('manufacturer.propValue').value
              ? this.propertiesFormGroup.get('manufacturer.propValue').value.nameRu : '';
          const reqVal = this.propertiesFormGroup.get('manufacturer.allValues').value ?
            '#all#' : this.propertiesFormGroup.get('manufacturer.propValue').value
              ? (this.propertiesFormGroup.get('manufacturer.propValue').value.nameRu
                || this.propertiesFormGroup.get('manufacturer.propValue').value) : '';
          return {name: 'Производитель', value: val, reqName: 'manufacturer', reqVal: reqVal};
        }
        if (value === 'model') {
          const val = this.propertiesFormGroup.get('model.allValues').value ?
            'все значения' :
            this.propertiesFormGroup.get('model.propValue').value
              ? this.propertiesFormGroup.get('model.propValue').value['value'] : '';
          const reqVal = this.propertiesFormGroup.get('model.allValues').value ?
            '#all#' : this.propertiesFormGroup.get('model.propValue').value
              ? this.propertiesFormGroup.get('model.propValue').value['value'] : '';
          return {name: 'Модель', value: val, reqName: 'model', reqVal: reqVal};
        }

        return {name: null, value: null, reqName: null, reqVal: null};

      } else {
        const val1 = this.propertiesFormGroup.get(`${fullProp.id}.allValues`).value ?
          'все значения' : this.propertiesFormGroup.get(`${fullProp.id}.propValue`).value;
        const reqVal1 = this.propertiesFormGroup.get(`${fullProp.id}.allValues`).value ?
          '#all#' : this.propertiesFormGroup.get(`${fullProp.id}.propValue`).value;
        return {name: fullProp.nameRu, value: val1, reqName: `${fullProp.id}`, reqVal: reqVal1};
      }
    });
  }

  /**
   * Fires on close button click
   */
  onSubmit(): void {
    this.pending = true;
    const props = this.getChosenProps().map(value => {
      const res = {};
      res[`${value.reqName}`] = value.reqVal;
      return res;
    });
    const body: any = {
      category: this.categoryId,
      type: this.marketPlaceCtrl.value,
      headerNameRu: this.seoFormGroup.get('header.nameRu').value,
      headerNameEn: this.seoFormGroup.get('header.nameEn').value,
      headerNameCn: this.seoFormGroup.get('header.nameCn').value,
      metaDescNameRu: this.seoFormGroup.get('metaDesc.nameRu').value,
      metaDescNameEn: this.seoFormGroup.get('metaDesc.nameEn').value,
      metaDescNameCn: this.seoFormGroup.get('metaDesc.nameCn').value,
      titleNameRu: this.seoFormGroup.get('title.nameRu').value,
      titleNameEn: this.seoFormGroup.get('title.nameEn').value,
      titleNameCn: this.seoFormGroup.get('title.nameCn').value,
      keywordsNameRu: this.seoFormGroup.get('keywords.nameRu').value,
      keywordsNameEn: this.seoFormGroup.get('keywords.nameEn').value,
      keywordsNameCn: this.seoFormGroup.get('keywords.nameCn').value,
      descriptionNameRu: this.seoFormGroup.get('description.nameRu').value,
      descriptionNameEn: this.seoFormGroup.get('description.nameEn').value,
      descriptionNameCn: this.seoFormGroup.get('description.nameCn').value,
      properties: this.flag ? [] : props,
      flexible: this.flag ? 1 : 0
    };

    if (this.isEdit) {
      this._seoService.updateCategoryMetaData(this.seoCategoryId, body)
        .pipe(takeUntil(this._unsubscribe$))
        .subscribe(() => {
          this.pending = false;
          this._snackBar.open('Метадата успешно изменена', 'OK', {
            duration: 3000,
          });
        }, () => {
          this.pending = false;
          this._snackBar.open('Произошла ошибка, попробуйте чуть позже', 'OK', {
            duration: 3000,
          });
        });
    } else {
      this._seoService.addCategoryMetaData(body)
        .pipe(takeUntil(this._unsubscribe$))
        .subscribe((res: any) => {
          this.pending = false;
          this.isEdit = true;
          this.seoCategoryId = +res['id'];
          this.isEdit = true;
          this._snackBar.open('Метадата успешно сохранена', 'OK', {
            duration: 3000,
          });
        }, () => {
          this.pending = false;
          this._snackBar.open('Произошла ошибка, попробуйте чуть позже', 'OK', {
            duration: 3000,
          });
        });
    }
  }

  private _initPropsFormGroup() {
    this.propertiesFormGroup = this._formBuilder.group({
      country: this._formBuilder.group({
        propValue: [{value: '', disabled: true}],
        allValues: [{value: true, disabled: true}]
      }),
      city: this._formBuilder.group({
        propValue: [{value: '', disabled: true}],
        allValues: [{value: true, disabled: true}]
      }),
      manufacturer: this._formBuilder.group({
        propValue: [{value: '', disabled: true}],
        allValues: [{value: true, disabled: true}]
      }),
      model: this._formBuilder.group({
        propValue: [{value: '', disabled: true}],
        allValues: [{value: true, disabled: true}]
      })
    });
    this.propertiesFormGroup.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(() => {
          this.pending = true;
          return this.refreshData();
        }),
        takeUntil(this._unsubscribe$),
      ).subscribe();
    this.propertiesFormGroup.get(`country.propValue`).valueChanges
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe(value => {
        if (!value) {
          this.propertiesFormGroup.get(`country.allValues`).setValue(true);
        } else {
          this.propertiesFormGroup.get(`country.allValues`).setValue(false);
        }
      });
    this.propertiesFormGroup.get(`city.propValue`).valueChanges
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe(value => {
        if (!value) {
          this.propertiesFormGroup.get(`city.allValues`).setValue(true);
        } else {
          this.propertiesFormGroup.get(`city.allValues`).setValue(false);
        }
      });
    this.models$ = this.propertiesFormGroup.get(`manufacturer.propValue`).valueChanges
      .pipe(
        switchMap((value: any) => {
          if (value && value.id) {
            return this._productsService.getProductModels({
              field: 'model',
              manufacturer: value.id,
              category: this.categoryId
            });
          }
          return of(null);
        }),
        map((models: any[]) => this.models = models)
      );
    this.propertiesFormGroup.get(`manufacturer.propValue`).valueChanges
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe(value => {
        if (!value) {
          this.propertiesFormGroup.get(`manufacturer.allValues`).setValue(true);
        } else {
          this.propertiesFormGroup.get(`manufacturer.allValues`).setValue(false);
        }
      });
    this.propertiesFormGroup.get(`model.propValue`).valueChanges
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe(value => {
        if (!value) {
          this.propertiesFormGroup.get(`model.allValues`).setValue(true);
        } else {
          this.propertiesFormGroup.get(`model.allValues`).setValue(false);
        }
      });
    this.properties.forEach(prop => {
      this.propertiesFormGroup.addControl(`${prop['id']}`, this._formBuilder.group({
        propValue: [{value: '', disabled: true}],
        allValues: [{value: true, disabled: true}]
      }));
      this.propertiesFormGroup.get(`${prop['id']}.propValue`).valueChanges
        .pipe(takeUntil(this._unsubscribe$))
        .subscribe(value => {
          if (!value) {
            this.propertiesFormGroup.get(`${prop['id']}.allValues`).setValue(true);
          } else {
            this.propertiesFormGroup.get(`${prop['id']}.allValues`).setValue(false);
          }
        });
    });
  }

  /**
   * Form group initialization
   */
  private _initFormGroup(): void {
    this.seoFormGroup = this._formBuilder.group({
      header: this._formBuilder.group({
        nameRu: [''],
        nameCn: [''],
        nameEn: ['']
      }),
      metaDesc: this._formBuilder.group({
        nameRu: [''],
        nameCn: [''],
        nameEn: ['']
      }),
      title: this._formBuilder.group({
        nameRu: [''],
        nameCn: [''],
        nameEn: ['']
      }),
      keywords: this._formBuilder.group({
        nameRu: [''],
        nameCn: [''],
        nameEn: ['']
      }),
      description: this._formBuilder.group({
        nameRu: [null],
        nameCn: [null],
        nameEn: [null]
      })
    });
  }

  setDataToForm(record: any): void {
    this.flag = record.flexible;
    this.matSlideToggleQueryList.forEach(matSlide => matSlide.checked = false);

    for (const key in this.propertiesFormGroup.controls) {
      if (this.propertiesFormGroup.controls.hasOwnProperty(key)) {
        const control = this.propertiesFormGroup.get(key);
        control.get('allValues').reset();
        control.get('propValue').reset();
        control.get('allValues').disable();
        control.get('propValue').disable();
      }
    }

    record.properties.forEach(el => {
      const key = Object.keys(el)[0];
      const value = el[key];
      const control = this.propertiesFormGroup.get(key);
      control.get('allValues').enable();
      control.get('propValue').enable();
      if (value === '#all#') {
        control.get('allValues').setValue(true);
        control.get('propValue').setValue(null);
      } else {
        control.get('allValues').setValue(false);
        control.get('propValue').setValue(value);
      }
    });

    this.matExpansionPanel.open();

    this.matSlideToggleQueryList.changes
      .pipe(
        first(),
        delay(300)
      )
      .subscribe(() => {
        this.matSlideToggleQueryList.forEach(matSlide => {
          if ((record.props as string).includes(matSlide.name)) {
            matSlide.toggle();
          }
        });
      });
  }
}
