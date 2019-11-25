import {Component, Input, OnInit} from '@angular/core';
import {forkJoin, Observable, Subscription} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {CategoryService} from '@b2b/services/category.service';
import {OrdersService} from '@b2b/services/orders.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Category} from '@b2b/models';
import {clearSubscription} from '@b2b/decorators';

@Component({
  selector: 'b2b-form-orders-item',
  templateUrl: './form-orders-item.component.html',
  styleUrls: ['./form-orders-item.component.scss']
})
export class FormOrdersItemComponent implements OnInit {
  @Input() category: Category;
  parentCategory: string;
  hasParent = false;

  private _categorySub: Subscription;
  private _parentSub: Subscription;

  constructor(
    private _categoryService: CategoryService,
    private _ordersService: OrdersService,
    private _route: ActivatedRoute,
    private _router: Router) {
  }

  ngOnInit() {
    this.hasParent = (/\./g).test(this.category.path);
  }

  onCategoryInfoClick(): void {
    const {path, id} = this.category;
    if (path && path.length > 0) {
      const observables = path.split('.')
        .filter(parentId => +parentId !== id)
        .map(parentId => this._categoryService.getCategoryById(+parentId));
      clearSubscription(this._parentSub);
      this._parentSub = forkJoin(observables)
        .subscribe((res: any) => {
          this.parentCategory = res.map(item => item.nameRu || item.nameEn || item.nameCn).join(' / ');
        });
    }
  }

  onEditCategoryClick(): void {
    this._router.navigate(['add', this.category.id], {relativeTo: this._route.parent});
  }

  onModeChanged(enabled: boolean): void {
    let observable: Observable<any>;
    const orderForm = this.category.orderForm;
    if (orderForm && orderForm.id) {
      orderForm.enabled = enabled;
      observable = this._ordersService.editOrderForm(orderForm.id, {enabled});
    } else {
      observable = this._ordersService.addOrderForm({category: this.category.id, enabled, status: 1});
    }
    if (this._categorySub && !this._categorySub.closed) {
      this._categorySub.unsubscribe();
    }
    this._categorySub = observable
      .pipe(
        // TODO workaround to trigger cleaning redis cache
        switchMap(() => this._categoryService.editCategoryMode(this.category, this.category.autoForm)),
      ).subscribe();
  }

}
