import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { CategoryService } from '@b2b/services/category.service';
import { clearSubscription } from '@b2b/decorators';
import { Category } from '@b2b/models';

@Component({
  selector: 'b2b-select-categories',
  templateUrl: './select-categories.component.html',
  styleUrls: ['./select-categories.component.scss']
})
export class SelectCategoriesComponent implements OnInit, OnDestroy {

  get selectedCategories(): number {
    return this._selectedCategories;
  }

  @Input() set selectedCategories(value: number) {
    this._selectedCategories = value;

    if (value) {
      this.loading = true;
      this._categoryService.getCategoryById(value)
        .pipe(takeUntil(this._unsubscribe$))
        .subscribe((res: any) => {
          this.loading = false;
          this.categories = [res];
          this._selectedCategories = res.id;
          this.selectedCategoryChange.emit(res);
        }, () => this.loading = false);
    }
  }

  @Input() multiple = false;
  @Input() disabled = false;

  @Output() selectedCategoryChange = new EventEmitter();

  categoriesInput = new Subject<string>();
  loading = false;
  categories: Category[] = [];
  pageSize = 0;
  pageCount = 0;
  length = 0;

  private _currentPage = 1;
  private _selectedCategories: number;
  private _categoriesSub: Subscription;
  private _unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private _categoryService: CategoryService) {
  }

  ngOnDestroy(): void {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }

  ngOnInit(): void {
    this._handleCategories();
  }

  onSelectedCategoryChanged(evt: any): void {
    this.selectedCategoryChange.emit(evt);
  }

  onCategoriesScrollToEnd(): void {
    this._currentPage++;
    this._currentPage = this._currentPage <= this.pageCount ? Math.min(this._currentPage, this.pageCount) : 1;
    clearSubscription(this._categoriesSub);
    if (this._currentPage > 1) {
      this._categoriesSub = this._getCategories(null, this._currentPage).subscribe();
    }
  }

  private _handleCategories() {
    this.categoriesInput
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => this.categories = []),
        filter(res => !!res),
        switchMap((name: string) => this._getCategories(name))
      ).subscribe();
  }

  private _getCategories(name = '', page = 1) {
    this.loading = true;
    return this._categoryService.getCategories(name, page)
      .pipe(
        map((res: any) => {
          this.loading = false;
          this.pageSize = res.pageSize;
          this.pageCount = res.pageCount;
          this.length = res.totalItems;

          return this.categories = [...this.categories, ...res.categories];
        })
      );
  }
}
