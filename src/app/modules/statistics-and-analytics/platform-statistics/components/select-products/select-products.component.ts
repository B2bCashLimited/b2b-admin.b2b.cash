import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ProductsService } from '@b2b/services/products.service';

@Component({
  selector: 'b2b-select-products',
  templateUrl: './select-products.component.html',
  styleUrls: ['./select-products.component.scss']
})
export class SelectProductsComponent implements OnInit, OnDestroy {

  productsLoading = false;
  query: string;
  pageCount = 0;
  productsInput$ = new Subject<string>();
  products: any[] = [];

  get selectedProducts() {
    return this._selectedProducts;
  }

  @Input() set selectedProducts(value: number | number[]) {
    this._selectedProducts = value;

    if (value && typeof value !== 'number' && value.length > 0) {
      this._productsService.getProductsByIds(value)
        .pipe(takeUntil(this._unsubscribe$))
        .subscribe((res: any) => {
          this.productsLoading = false;
          this.products = res;
          this.selectedProductsChange.emit(res);
        }, () => this.productsLoading = false);
    }
  }

  @Input() set reset(bool: boolean) {
    if (bool) {
      this._selectedProducts = [];
    }
  }

  @Input() disabled = true;
  @Output() selectedProductsChange = new EventEmitter();

  private _selectedProducts: number | number[];
  private _productsCurrentPage = 1;
  private _unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private _productsService: ProductsService) {
  }

  ngOnInit(): void {
    this._handleProducts();
  }

  ngOnDestroy(): void {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }

  /**
   * Fires an event every time products changed
   */
  onSelectedProductsChanged(evt: any[]): void {
    this.selectedProductsChange.emit(evt);
  }

  /**
   * Fires every time products list scrolls to end
   */
  onProductsScrollToEnd(): void {
    this._productsCurrentPage++;
    this._productsCurrentPage = this._productsCurrentPage <= this.pageCount ? Math.min(this._productsCurrentPage, this.pageCount) : 1;

    if (this._productsCurrentPage > 1) {
      this.getProducts(this.query, this._productsCurrentPage)
        .pipe(takeUntil(this._unsubscribe$))
        .subscribe(() => this.productsLoading = false, () => this.productsLoading = false);
    }
  }

  /**
   * Handle products
   */
  private _handleProducts(): void {
    this.productsInput$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        filter(res => !!res),
        tap(() => {
          this.productsLoading = true;
          this.products = [];
        }),
        switchMap((name: string) => {
          this.query = name;
          return this.getProducts(name);
        })
      )
      .subscribe(() => this.productsLoading = false, () => this.productsLoading = false);
  }

  /**
   * Retrieves products by given name
   */
  getProducts(query: string, page = 1): Observable<any> {
    return this._productsService.getProductsByName(query, page)
      .pipe(
        map((res: any) => {
          this.pageCount = res.pageCount;
          this.products = [...this.products, ...res.products];
        })
      );
  }

}
