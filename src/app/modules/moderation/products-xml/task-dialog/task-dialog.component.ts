import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource, PageEvent } from '@angular/material';
import { CategoryService } from '@b2b/services/category.service';
import { FEED_PROCESS_TYPES, TASK_STATUSES } from 'app/core/enums/feed';
import { Observable, Subject, Subscription } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { clearSubscription } from '@b2b/decorators';

@Component({
  selector: 'b2b-task-dialog',
  templateUrl: './task-dialog.component.html',
  styleUrls: ['./task-dialog.component.scss']
})
export class TaskDialogComponent implements OnInit, OnDestroy {

  displayedColumns: string[] = ['task', 'date', 'status'];
  dataSource: MatTableDataSource<any>;

  tasks: any[] = [];
  feed: number;
  pager: PageEvent = {
    length: 0,
    pageIndex: 0,
    pageSize: 0
  };
  isLoading = false;

  private _page = 1;
  private _tasksListSub$: Subscription;
  private _unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private _categoryService: CategoryService,
    private _dialogRef: MatDialogRef<TaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.feed = this.data.feed;
  }

  ngOnDestroy(): void {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.getTasksList()
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe(() => this.isLoading = false, () => this.isLoading = false);
  }

  onPageChanged(pageEvent: PageEvent): void {
    this._page = pageEvent.pageIndex + 1;

    clearSubscription(this._tasksListSub$);
    this._tasksListSub$ = this.getTasksList()
      .subscribe(() => this.isLoading = false, () => this.isLoading = false);
  }

  getTasksList(): Observable<any> {
    const query: any = {
      feed: this.feed,
      page: this._page
    };
    this.isLoading = true;

    return this._categoryService.retrieveTasks(query)
      .pipe(
        map(({pager, data}) => {
          this.pager = {
            pageSize: pager.perPage,
            length: pager.totalItems,
            pageIndex: pager.currentPage - 1
          };

          this.tasks = data.map((item) => ({
            id: item.id,
            type: this.getTypeObject(item.type),
            dateCreated: item.dateCreated,
            dateUpdated: item.dateUpdated,
            status: this.getStatusObject(item.status)
          }));
          this.dataSource = new MatTableDataSource(this.tasks);
        })
      );
  }

  private getStatusObject(status: number) {
    switch (status) {
      case TASK_STATUSES.NEW:
        return {
          id: status,
          icon: 'status-new',
          text: 'Новая задача'
        };
      case TASK_STATUSES.IN_PROGRESS:
        return {
          id: status,
          icon: 'status-in-progress',
          text: 'Задача выполняется...'
        };
      case TASK_STATUSES.COMPLETED:
        return {
          id: status,
          icon: 'status-completed',
          text: 'Завершено успешно'
        };
      case TASK_STATUSES.FAILED:
        return {
          id: status,
          icon: 'status-faild',
          text: 'Ошибка. Не завершено'
        };
    }
  }

  private getTypeObject(type: number) {
    switch (type) {
      case FEED_PROCESS_TYPES.GENERATE_PREVIEW:
        return 'Генерация превью для фидов';
      case FEED_PROCESS_TYPES.FIELDS_STAT:
        return 'Статистика фида по полям';
      case FEED_PROCESS_TYPES.VALUES_STAT:
        return 'Статистика фида по значениям';
      case FEED_PROCESS_TYPES.PARSE_UNKNOWN:
        return 'Парсинг неизвестного фида';
      case FEED_PROCESS_TYPES.EXPORT_PRODUCTS:
        return 'Экспорт напаршенных продукт';
      case FEED_PROCESS_TYPES.PARSE_RAW_PRODUCTS:
        return 'Парсинг сырых продуктов на основе схемы';
    }
  }

  onSubmit() {
    const body = {
      type: FEED_PROCESS_TYPES.PARSE_RAW_PRODUCTS,
      status: 1,
      feed: this.feed,
    };

    this._categoryService.addTask(body).subscribe((res: any) => {
      this.tasks.push({
        id: res.id,
        type: this.getTypeObject(res.type),
        dateCreated: res.dateCreated,
        dateUpdated: res.dateUpdated,
        status: this.getStatusObject(res.status)
      });

      this.dataSource = new MatTableDataSource(this.tasks);
    });
  }
}
