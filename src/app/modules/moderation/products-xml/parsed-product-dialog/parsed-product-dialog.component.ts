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
      feed: this.data.feed,
      status: this.status,
      page: this._page,
      limit: this._limit
    };
    clearSubscription(this._itemsSub$);
    this._itemsSub$ = this._categoryService.retrieveFeedProducts(query).subscribe(({ pager, data }) => {
      this.pager = {
        pageSize: pager.perPage,
        length: pager.totalItems,
        pageIndex: pager.currentPage
      };

      this.dataSource = data.map((item) => {
        item['statusObject'] = this.getStatusObject(item.status);
        return item;
      });
    });
  }

  dataTableSource(source: any): any[] {
    const result = [];
    Object.keys(source).map((key, i) => {
      if (typeof source[key] === 'object') {
        Object.keys(source[key]).forEach((innerKey) => {
          result.push({
            prop: `${key}/${innerKey}`,
            value: source[key][innerKey]
          });
        });
      } else {
        result.push({
          prop: key,
          value: source[key]
        });
      }
    });
    return result;
  }

  parsingProducts() {
    const body = {
      type: FEED_PROCESS_TYPES.PARSE_RAW_PRODUCTS,
      status: 1,
      feed: this.data.feed,
    };
    this._categoryService.addTask(body).subscribe(() => this._dialogRef.close());
  }

  onSubmit() {
    const body = {
      type: FEED_PROCESS_TYPES.EXPORT_PRODUCTS,
      status: 1,
      feed: this.data.feed,
    };
    this._categoryService.addTask(body).subscribe(() => this._dialogRef.close());
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
