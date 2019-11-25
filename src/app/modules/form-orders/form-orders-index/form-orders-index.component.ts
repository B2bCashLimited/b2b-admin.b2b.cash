import {Component, OnDestroy, OnInit} from '@angular/core';
import {PageEvent} from '@angular/material';
import {CategoryService} from '@b2b/services/category.service';
import {debounceTime, distinctUntilChanged, map, startWith, switchMap} from 'rxjs/operators';
import {Observable, Subscription} from 'rxjs';
import {FormControl} from '@angular/forms';
import {clearSubscription, ClearSubscriptions} from '@b2b/decorators';

@ClearSubscriptions()
@Component({
  selector: 'b2b-index',
  templateUrl: './form-orders-index.component.html',
  styleUrls: ['./form-orders-index.component.scss']
})
export class FormOrdersIndexComponent implements OnInit, OnDestroy {
  formControl = new FormControl();
  pageCount = 0;
  pageSize = 0;
  length = 0;
  categories;

  private _categorySub: Subscription;
  private _currentPage = 1;

  constructor(
    private _categoryService: CategoryService) {
  }

  ngOnDestroy(): void {
    // @ClearSubscriptions()
  }

  ngOnInit(): void {
    this.formControl.valueChanges
      .pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((value: string) => {
          this.categories = [];
          return this._getCategories(value, this._currentPage);
        })
      ).subscribe();
  }

  getPage(pageEvent: PageEvent): void {
    const pageIndex = pageEvent.pageIndex + 1;
    this._currentPage = pageIndex <= this.pageCount ? Math.min(pageIndex, this.pageCount) : 1;
    clearSubscription(this._categorySub);
    this._categorySub = this._getCategories(this.formControl.value, this._currentPage).subscribe();
  }

  private _getCategories(name: string, page = 1): Observable<any> {
    return this._categoryService.getLastCategories(name, page)
      .pipe(
        map((res: any) => {
          this.pageSize = res.pageSize;
          this.pageCount = res.pageCount;
          this.length = res.pageCount * res.pageSize;
          return this.categories = res.categories;
        })
      );
  }

}
