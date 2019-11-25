import { clearSubscription } from '@b2b/decorators';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CategoryService } from '@b2b/services/category.service';
import { FEED_PROCESS_TYPES, FEED_PRODUCT_STATUSES } from 'app/core/enums/feed';
import { PageEvent } from '@angular/material';
import { Subscription } from 'rxjs';

@Component({
  selector: 'b2b-parsed-product-dialog',
  templateUrl: './parsed-product-dialog.component.html',
  styleUrls: ['./parsed-product-dialog.component.scss']
})
export class ParsedProductDialogComponent implements OnInit {

  displayedColumns: string[] = ['prop', 'value'];
  dataSource: any;
  status = '';
  pager: PageEvent = {
    length: 0,
    pageIndex: 0,
    pageSize: 0
  };

  tableRows = [
    { pos: 0, title: 'Категория товара', ctrlName: 'category', required: true },
    { pos: 1, title: 'Название En', ctrlName: 'nameEn', required: true },
    { pos: 2, title: 'Название Ru', ctrlName: 'nameRu', required: false },
    { pos: 3, title: 'Название Cn', ctrlName: 'nameCn', required: false },
    { pos: 4, title: 'Модель En', ctrlName: 'productModelEn', required: true },
    { pos: 5, title: 'Модель Ru', ctrlName: 'productModelRu', required: false },
    { pos: 6, title: 'Модель Cn', ctrlName: 'productModelCn', required: false },
    { pos: 7, title: 'Артикул', ctrlName: 'articleCode', required: true },
    { pos: 8, title: 'Фотографии', ctrlName: 'image', required: false },
    { pos: 9, title: 'Название фабрики Еn', ctrlName: 'productManufacturerEn', required: true },
    { pos: 10, title: 'Название фабрики Ru', ctrlName: 'productManufacturerRu', required: false },
    { pos: 11, title: 'Название фабрики Cn', ctrlName: 'productManufacturerCn', required: false },
    { pos: 12, title: 'Вес нетто', ctrlName: 'net', required: false },
    { pos: 13, title: 'Вес брутто', ctrlName: 'gross', required: false },
    { pos: 14, title: 'Объем', ctrlName: 'volume', required: false },
    { pos: 15, title: 'Цена', ctrlName: 'price', required: true },
  ];

  missingProps = [];
  categoriesBuffer = [];

  private _page = 1;
  private _limit = 10;
  private _itemsSub$: Subscription;

  constructor(
    private _categoryService: CategoryService,
    private _dialogRef: MatDialogRef<ParsedProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    this.getParsingProductsList();
  }

  onPageChanged(pageEvent: PageEvent): void {
    this._page = pageEvent.pageIndex + 1;
    this.getParsingProductsList();
  }

  onStatusChange() {
    this.getParsingProductsList();
  }

  getParsingProductsList() {
    const query = {
      feed: this.data.feed.id,
      status: this.status,
      page: this._page,
      limit: this._limit
    };
    clearSubscription(this._itemsSub$);
    this._itemsSub$ = this._categoryService.retrieveFeedProducts(query).subscribe(({ pager, data }) => {
      this.pager = {
        pageSize: pager.perPage,
        length: pager.totalItems,
        pageIndex: (pager.currentPage || 1) - 1
      };

      const fields = {};

      if (this.data.feed.structure.fields) {
        Object.keys(this.data.feed.structure.fields).forEach(key => {
          if (this.data.feed.structure.fields[key] &&
              this.data.feed.structure.fields[key].column) {
            fields[this.data.feed.structure.fields[key].column] = key;
          }
        });

        this.dataSource = data.map((item) => {
          try {
            item.sourceCopy = JSON.parse(JSON.stringify(item.source));
          } catch {}
          item['statusObject'] = this.getStatusObject(item.status);

          Object.keys(item.product).forEach(key => {
            if (!item.product[key]) {
              delete item.product[key];
            }
          });
          Object.keys(item.source).forEach(key => {
            if (fields[key]) {
              item.source[fields[key]] = item.source[key];
            }
            delete item.source[key];
          });

          item['tableData'] = [];
          this.tableRows.forEach(column => {
            if (column.ctrlName === 'category' && item.product[column.ctrlName]) {
              const inBuffer = this.categoriesBuffer.find(category => category.id === parseInt(item.product[column.ctrlName], 10));
              if (!inBuffer) {
                this._categoryService.getCategoryById(parseInt(item.product[column.ctrlName], 10)).subscribe((res) => {
                  item['tableData'].unshift({
                    title: column.title,
                    source: item.source[column.ctrlName],
                    product: res.nameRu
                  });
                  const alreadyBuffered = this.categoriesBuffer
                                              .find(category => category.id === parseInt(item.product[column.ctrlName], 10));
                  if (!alreadyBuffered) {
                    this.categoriesBuffer.push(res);
                  }
                });
              } else {
                item['tableData'].unshift({
                  title: column.title,
                  source: item.source[column.ctrlName],
                  product: inBuffer.nameRu
                });
              }
            } else {
              if (item.source[column.ctrlName] || item.product[column.ctrlName]) {
                item['tableData'].push({
                  title: column.title,
                  source: item.source[column.ctrlName],
                  product: item.product[column.ctrlName]
                });
              } else if (column.required) {
                if ((column.ctrlName === 'productModelEn' || column.ctrlName === 'productManufacturerEn') && !item.product['articleCode']) {
                  item['tableData'].push({
                    title: column.title,
                    source: 'не указано',
                    product: 'не указано',
                    notSpecified: true
                  });
                } else if (column.ctrlName === 'articleCode' &&
                          (!item.product['productModelEn'] || !item.product['productManufacturerEn'])) {
                  item['tableData'].push({
                    title: column.title,
                    source: 'не указано',
                    product: 'не указано',
                    notSpecified: true
                  });
                } else if (column.ctrlName !== 'productModelEn' && column.ctrlName !== 'productManufacturerEn'
                                                                && column.ctrlName !== 'articleCode') {
                  item['tableData'].push({
                    title: column.title,
                    source: 'не указано',
                    product: 'не указано',
                    notSpecified: true
                  });
                }
              }
            }
          });

          return item;
        });
      }

      if (this.data.feed.structure._extCategories) {
        this.data.feed.structure._extCategories.forEach(category => {
          category.properties.filter(property => property && property.propObj).forEach((property) => {
            if (property && property.missing) {
              this.missingProps.push(property.propObj);

              this.dataSource.forEach(item => {
                item['tableData'].push({
                  title: property.propObj.nameRu,
                  source: 'не указано',
                  product: 'не указано',
                  notSpecified: true
                });
              });
            } else if (property) {
              this.dataSource.forEach(item => {
                if (item.product.properties) {
                  item.product.properties.filter(prodProp => prodProp.id === parseInt(property.prop, 10)).forEach(prodProp => {
                    const columnValue = property.column ? item.sourceCopy[property.column.column] : '';

                    item['tableData'].push({
                      title: property.propObj.nameRu,
                      source: columnValue,
                      product: prodProp.ru
                    });
                  });
                }
              });
            }
          });
        });
      }
    });
  }

  parsingProducts() {
    const body = {
      type: FEED_PROCESS_TYPES.PARSE_RAW_PRODUCTS_XLS,
      status: 1,
      feed: this.data.feed.id,
    };
    this._categoryService.addTask(body).subscribe(() => this._dialogRef.close());
  }

  onSubmit() {
    const body = {
      type: FEED_PROCESS_TYPES.EXPORT_PRODUCTS_XLS,
      status: 1,
      feed: this.data.feed.id,
    };
    this._categoryService.addTask(body).subscribe(() => this._dialogRef.close());
  }

  notifyFeedModeration() {
    this._categoryService.feedModerationNotification(this.data.feed.id, this.missingProps);
    this._dialogRef.close();
  }

  private getStatusObject(status: number) {
    switch (status) {
      case FEED_PRODUCT_STATUSES.REQUIRED_FIELDS_MISSED:
        return {
          id: status,
          icon: 'status-0',
          text: 'Не найдены обязательные поля'
        };
      case FEED_PRODUCT_STATUSES.CATEGORY_NOT_RECOGNIZED:
        return {
          id: status,
          icon: 'status-1',
          text: 'Категория найдена, но не распознана'
        };
      case FEED_PRODUCT_STATUSES.CATEGORY_AMBIGUOUS:
        return {
          id: status,
          icon: 'status-2',
          text: 'Найдено более одной подходящий категории'
        };
      case FEED_PRODUCT_STATUSES.PROPERTIES_INCOMPATIBLE:
        return {
          id: status,
          icon: 'status-3',
          text: 'Характеристики не соответствуют категории'
        };
      case FEED_PRODUCT_STATUSES.CATEGORY_QUALITY_LOW:
        return {
          id: status,
          icon: 'status-4',
          text: 'Категория найдена неточным соответствием'
        };
      case FEED_PRODUCT_STATUSES.CATEGORY_QUALITY_HIGH:
        return {
          id: status,
          icon: 'status-5',
          text: 'Категория найдена точным соответствием'
        };
      case FEED_PRODUCT_STATUSES.PERFECT:
        return {
          id: status,
          icon: 'status-6',
          text: 'Все поля распарсились корректно'
        };
    }
  }
}
