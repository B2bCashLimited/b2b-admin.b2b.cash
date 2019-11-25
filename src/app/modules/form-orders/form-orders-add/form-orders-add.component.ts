import {Component, OnDestroy, OnInit} from '@angular/core';
import {CategoryService} from '@b2b/services/category.service';
import {ActivatedRoute, Router} from '@angular/router';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {filter, map, mergeMap, switchMap} from 'rxjs/operators';
import {MatDialog} from '@angular/material';
import {OrderBusinessPropertyDialogComponent} from './dialogs/order-business-property-dialog/order-business-property-dialog.component';
import {clearSubscription} from '@b2b/decorators';
import {forkJoin, Subscription} from 'rxjs';

@Component({
  selector: 'b2b-add',
  templateUrl: './form-orders-add.component.html',
  styleUrls: ['./form-orders-add.component.scss']
})
export class FormOrdersAddComponent implements OnInit, OnDestroy {
  categoryProperties: any;
  categoryPropertiesToShow: any[];
  businessProperties: any;
  businessPropertiesToShow: any;
  defaultProperties = [];
  isLoading = false;

  private _orderFormId: number;
  private _prioritySub: Subscription;

  constructor(
    private _categoryService: CategoryService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _matDialog: MatDialog) {
  }

  drop(evt: CdkDragDrop<string[]>) {
    const obs = [];
    if (this.categoryPropertiesToShow && this.categoryPropertiesToShow.length > 0) {
      this.isLoading = true;
      moveItemInArray(this.categoryPropertiesToShow, evt.previousIndex, evt.currentIndex);
      const ids = this.categoryPropertiesToShow.map((item, index) => ({id: item.id, orderPriority: index}));
      ids.forEach(item => obs.push(this._categoryService.updateCategoryProperties(item.id, {orderPriority: item.orderPriority})))
      clearSubscription(this._prioritySub);
      this._prioritySub = forkJoin(obs).subscribe(() => this.isLoading = false);
    }
  }

  dropBusinessProperties(evt: CdkDragDrop<string[]>) {
    if (this.businessPropertiesToShow && this.businessPropertiesToShow.length > 0) {
      moveItemInArray(this.businessPropertiesToShow, evt.previousIndex, evt.currentIndex);
    }
  }

  ngOnDestroy(): void {
  }

  ngOnInit(): void {
    const {categoryId} = this._route.snapshot.params;
    this._categoryService.getCategoryById(categoryId)
      .pipe(
        filter((category: any) => category.orderForm && category.orderForm.id),
        switchMap((category: any) => {
          this._orderFormId = category.orderForm.id;
          return this._categoryService.getFormOrderBusinessProperties(this._orderFormId);
        })
      )
      .subscribe((res) => {
        this.businessProperties = res.businessProperties
          .filter(item => !item.enabled)
          .sort((a, b) => a.priority - b.priority);
        this.businessPropertiesToShow = res.businessProperties
          .filter(item => item.enabled)
          .sort((a, b) => a.priority - b.priority);
      });
    this._categoryService.getCategoryProperties(categoryId)
      .subscribe((res) => {
        this.defaultProperties =  res.categoryProperties.filter( item => !item.orderEnabled);
        this.categoryPropertiesToShow = res.categoryProperties
          .filter(item => !!item.orderEnabled)
          .sort((a, b) => a.orderPriority - b.orderPriority);
      });
  }

  onAddBusinessPropertyDialogClick(): void {
    this._matDialog.open(OrderBusinessPropertyDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {}
    }).afterClosed()
      .pipe(
        filter((res) => res && !!res),
        switchMap((res) => {
          res.orderForm = this._orderFormId;
          return this._categoryService.addFormOrderBusinessProperties(res);
        })
      )
      .subscribe((res) => {
        this.businessProperties = [...this.businessProperties, res];
      });
  }

  onDestroyBusinessPropertyClick(categoryProperty: any) {
    this._categoryService.deleteFormOrderBusinessProperties(categoryProperty.id)
      .subscribe(() => {
        this.businessProperties = this.businessProperties
          .filter(item => item.id !== categoryProperty.id);
      });
  }

  onEditBusinessPropertyClick(categoryProperty: any) {
    this._matDialog.open(OrderBusinessPropertyDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {categoryProperty}
    }).afterClosed()
      .pipe(
        filter((res) => res && !!res),
        switchMap((res) => {
          const {categoryId} = this._route.snapshot.params;
          res.category = +categoryId;
          return this._categoryService.updateFormOrderBusinessProperties(categoryProperty.id, res);
        })
      )
      .subscribe(() => {

      });
  }

  changeOrderActivity(property: any, value: boolean): void {
    this.isLoading = true;
    const {categoryId} = this._route.snapshot.params;
    const body = {
      orderEnabled: +value
    };

    this._categoryService.updateCategoryProperties(property.id, body)
      .pipe(
        mergeMap(() =>  this._categoryService.getCategoryProperties(categoryId)),
        map( category => {
          this.defaultProperties =  category.categoryProperties.filter( item => !item.orderEnabled);
          this.categoryPropertiesToShow = category.categoryProperties
            .filter(item => !!item.orderEnabled)
            .sort((a, b) => a.orderPriority - b.orderPriority);
        })
      )
      .subscribe( res => this.isLoading = false)
  }

  onDisableBusinessPropertyClick(property: any) {
    const body = {value: property.value, enabled: false, priority: property.priority};
    return this._categoryService
      .updateFormOrderBusinessProperties(property.id, body)
      .subscribe((res) => {
        this.businessPropertiesToShow = this.businessPropertiesToShow
          .filter(item => item.id !== property.id);
        this.businessProperties = [...this.businessProperties, res];
      });
  }

  onAddBusinessPropertyClick(property: any) {
    const addedItem = this.businessPropertiesToShow.find(item => item.id === property.id);
    if (addedItem) {
      // TODO show message
    } else {
      const body = {value: property.value, enabled: true, priority: property.priority};
      return this._categoryService
        .updateFormOrderBusinessProperties(property.id, body)
        .subscribe((res) => {
          this.businessProperties = this.businessProperties
            .filter(item => item.id !== property.id);
          this.businessPropertiesToShow = [...this.businessPropertiesToShow, res];
        });
    }
  }

}
