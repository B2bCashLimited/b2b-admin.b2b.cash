import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CategoryService } from '@b2b/services/category.service';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog, PageEvent } from '@angular/material';
import { SetSchemeDialogComponent } from './set-scheme-dialog/set-scheme-dialog.component';
import { TaskDialogComponent } from './task-dialog/task-dialog.component';
import { ParsedProductDialogComponent } from './parsed-product-dialog/parsed-product-dialog.component';
import { XlsFileUploadDialogComponent } from './xls-file-upload-dialog/xls-file-upload-dialog.component';
import { DateRangeComponent } from '@b2b/shared/dialogs';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import * as moment from 'moment';

const ACTIONS: any = {
  setScheme: ''
};
const STATUSES: any = {

};

@Component({
  selector: 'b2b-products-xls',
  templateUrl: './products-xls.component.html',
  styleUrls: ['./products-xls.component.scss']
})
export class ProductsXlsComponent implements OnInit {
  displayedColumns: string[] = ['id', 'dateAndUser', 'activityAndShowcase', 'fileOrUrl', 'status', 'actions'];
  dataSource: MatTableDataSource<any>;
  rawFeed: any;
  structureStatus;
  limit = 5;
  page = 1;
  pager: PageEvent = {
    length: 0,
    pageIndex: 0,
    pageSize: 0
  };

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  public File: File;
  _saveSub: Subscription;

  dateFrom: string;
  dateTo: string;
  maxDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  minDate = new Date(new Date().getFullYear() - 2, new Date().getMonth(), new Date().getDate());
  startDate: string | Date = new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate());
  finishDate: string | Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  constructor(
    private _matDialog: MatDialog,
    private _categoryService: CategoryService
  ) { }

  ngOnInit() {
    this.getFeedList();
  }

  getFeedList() {
    const query = {
      type: 4, // xls = 4
      dateFrom: this.dateFrom,
      dateTo: this.dateTo,
      structureStatus: this.structureStatus,
      limit: this.limit,
      page: this.page
    };
    this._categoryService.retrieveFeeds(query).subscribe(({ pager, data }) => {
      this.pager = {
        pageSize: pager.perPage,
        length: pager.totalItems,
        pageIndex: pager.currentPage
      };

      const feed = this.mapStatusForFeed(data);
      this.rawFeed = feed;
      this.dataSource = new MatTableDataSource(feed);
    });
  }

  mapStatusForFeed(feed) {
    return feed.map((item) => {
      switch (+item.structureStatus) {
        case 0:
          item.statusObject = {
            id: item.structureStatus,
            icon: 'scheme-none',
            text: 'Схема не установлена'
          };
          break;
        case 1:
          item.statusObject = {
            id: item.structureStatus,
            icon: 'scheme-base',
            text: 'Установлены базовые элементы'
          };
          break;
        case 2:
          item.statusObject = {
            id: item.structureStatus,
            icon: 'scheme-installed',
            text: 'Схема установлена'
          };
          break;
      }

      return item;
    });
  }

  onSetSchemeClick(feed) {
    this._matDialog.open(SetSchemeDialogComponent, {
      width: '1200px',
      data: {
        preview: feed.preview,
        structure: feed.structure,
        fieldsStat: feed.fieldsStat,
        valuesStat: feed.valuesStat,
        feed
      }
    }).afterClosed().subscribe((data) => {
      if (data) {
        const feedIndex = this.rawFeed.findIndex(feedI => feedI.id === data.id);
        this.rawFeed[feedIndex] = data;
        this.rawFeed = this.mapStatusForFeed(this.rawFeed);
        this.dataSource = new MatTableDataSource(this.rawFeed);
      }
    });
  }

  onTaskClick(feed) {
    this._matDialog.open(TaskDialogComponent, {
      width: '840px',
      data: {
        feed: feed.id
      }
    }).afterClosed().subscribe();
  }

  onParsedProductClick(feed) {
    this._matDialog.open(ParsedProductDialogComponent, {
      width: '1200px',
      data: {
        feed
      }
    }).afterClosed().subscribe();
  }

  /**
   * Opens date picker dialog to choose periods
   */
  onDateChange() {
    const data: any = {
      minDate: this.minDate,
      maxDate: this.maxDate,
      startDate: this.startDate,
      finishDate: this.finishDate,
    };

    this._matDialog.open(DateRangeComponent, {
      width: '400px',
      height: 'auto',
      data
    }).afterClosed()
      .pipe(first())
      .subscribe(resp => {
        if (resp) {
          const [dateFrom, dateTo] = resp;

          if (resp.length === 2) {
            if (dateFrom.getTime() < dateTo.getTime()) {
              this.startDate = dateFrom;
              this.finishDate = dateTo || dateFrom;
            } else {
              this.startDate = dateTo || dateFrom;
              this.finishDate = dateFrom;
            }
          } else if (resp.length === 1) {
            this.startDate = this.finishDate = dateFrom;
          }

          this.dateFrom = moment(this.startDate).format('YYYY-MM-DD');
          this.dateTo = moment(this.finishDate).format('YYYY-MM-DD');
        }
      });
  }

  onSearch() {
    this.getFeedList();
  }

  onPageChange(pageEvent: PageEvent): void {
    this.limit = pageEvent.pageSize;
    this.page = pageEvent.pageIndex + 1;
    this.getFeedList();
  }

  onFileAdded(feedId: number, event) {
    const files: { [key: string]: File } = event.target.files;
    for (const key in files) {
      if (!isNaN(parseInt(key, 3))) {
        this.File = files[key];
      }
    }

    this.uploadFile(feedId);
  }

  uploadFile(feedId: number) {
    if (this._saveSub && !this._saveSub.closed) {
      this._saveSub.unsubscribe();
    }
    const formData: FormData = new FormData();
    formData.append('file', this.File, this.File.name);
    formData.append('feed', `${feedId}`);
    this._saveSub = this._categoryService.saveProductsFromFile(formData)
      .subscribe(res => {
        this._matDialog.open(XlsFileUploadDialogComponent, {
          width: '560px',
          data: {
            text: 'Новый файл успешно загружен.',
            sign: '✓'
          }
        }).afterClosed().subscribe();
      }, err => {
        this._matDialog.open(XlsFileUploadDialogComponent, {
          width: '560px',
          data: {
            text: 'Не удалось загрузить файл',
            sign: 'X'
          }
        }).afterClosed().subscribe();
      });
  }
}
