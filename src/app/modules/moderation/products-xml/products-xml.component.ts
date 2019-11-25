import { Component, OnInit, ViewChild } from '@angular/core';
import { CategoryService } from '@b2b/services/category.service';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog, PageEvent } from '@angular/material';
import { SetSchemeDialogComponent } from './set-scheme-dialog/set-scheme-dialog.component';
import { GeneratePreviewDialogComponent } from './generate-preview-dialog/generate-preview-dialog.component';
import { TaskDialogComponent } from './task-dialog/task-dialog.component';
import { ParsedProductDialogComponent } from './parsed-product-dialog/parsed-product-dialog.component';
import { DateRangeComponent } from '@b2b/shared/dialogs';
import { first } from 'rxjs/operators';
import * as moment from 'moment';

const ACTIONS: any = {
  setScheme: ''
};
const STATUSES: any = {

};

@Component({
  selector: 'b2b-products-xml',
  templateUrl: './products-xml.component.html',
  styleUrls: ['./products-xml.component.scss']
})
export class ProductsXmlComponent implements OnInit {
  displayedColumns: string[] = ['id', 'dateAndUser', 'activityAndShowcase', 'fileOrUrl', 'status', 'actions'];
  dataSource: MatTableDataSource<any>;
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
      type: 3,
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

      const feed = data.map((item) => {
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
      this.dataSource = new MatTableDataSource(feed);
    });
  }

  onSetSchemeClick(feed) {
    this._matDialog.open(SetSchemeDialogComponent, {
      width: '1200px',
      data: {
        preview: feed.preview,
        structure: feed.structure,
        fieldsStat: feed.fieldsStat[0],
        valuesStat: feed.valuesStat,
        feed
      }
    }).afterClosed().subscribe();
  }

  onGeneratePreviewClick(feed) {
    this._matDialog.open(GeneratePreviewDialogComponent, {
      width: '840px',
      data: {
        preview: feed.preview,
        feed: feed.id
      }
    }).afterClosed().subscribe();
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
      width: '1000px',
      data: {
        feed: feed.id
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
}
