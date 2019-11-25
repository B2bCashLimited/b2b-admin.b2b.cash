import { Component, OnDestroy, OnInit } from '@angular/core';
import { CategoryService } from '@b2b/services/category.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { filter, switchMap, takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { CategoryFeatureDialogComponent } from '@b2b/shared/components/category-feature-dialog/category-feature-dialog.component';
import {
  CategoryBusinessPropertyDialogComponent
} from './dialogs/category-business-property-dialog/category-business-property-dialog.component';
import { Subject, Subscription } from 'rxjs';
import { clearSubscription } from '@b2b/decorators';
import { FormulaDialogComponent } from './dialogs/formula-dialog/formula-dialog.component';
import { ConfirmDeleteComponent } from './dialogs/confirm-delete/confirm-delete.component';
import { isSpecialCategory } from '@b2b/utils';
import { ToastrService } from 'ngx-toastr';
import { SocketService } from '@b2b/services/socket.service';
import { PropertyOverrideDialogComponent } from '@b2b/shared/components/property-override-dialog/property-override-dialog.component';
import { PropertyJoinDialogComponent } from '@b2b/shared/components/property-join-dialog/property-join-dialog.component';

@Component({
  selector: 'b2b-category-features-add',
  templateUrl: './category-features-add.component.html',
  styleUrls: ['./category-features-add.component.scss']
})
export class CategoryFeaturesAddComponent implements OnInit, OnDestroy {

  businessProperties: any;
  businessPropertiesToShow: any;
  categoryProperties: any;
  categoryPropertiesToShow: any[];

  private _defaultProperties = [
    {
      nameRu: 'Нетто',
      nameEn: 'Нетто',
      nameCn: 'Нетто',
      default: true
    },
    {
      nameRu: 'Брутто',
      nameEn: 'Брутто',
      nameCn: 'Брутто',
      default: true
    },
    {
      nameRu: 'Цена за',
      nameEn: 'Цена за',
      nameCn: 'Цена за',
      default: true
    },
    {
      nameRu: 'Объем',
      nameEn: 'Объем',
      nameCn: 'Объем',
      default: true
    }
  ];

  private _prioritySub: Subscription;
  private _categoryId = this._route.snapshot.params['categoryId'];
  private _unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private _categoryService: CategoryService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _matDialog: MatDialog,
    private _socketService: SocketService,
    private _toastrService: ToastrService) {
  }

  ngOnDestroy(): void {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }

  ngOnInit(): void {
    this._getCategoryFeaturesBusinessProperties();
    this._getCategoryFeaturesProperties();
  }

  drop(evt: CdkDragDrop<string[]>): void {
    if (this.categoryPropertiesToShow && this.categoryPropertiesToShow.length > 0) {
      moveItemInArray(this.categoryPropertiesToShow, evt.previousIndex, evt.currentIndex);
      const ids = this.categoryPropertiesToShow.map((item, index) => ({ id: item.id, priority: index }));
      clearSubscription(this._prioritySub);
      this._prioritySub = this._categoryService.updatePropertyPriority(ids).subscribe();
      this._socketService.emit('category_property_order', { data: ids });
    }
  }

  dropBusinessProperties(evt: CdkDragDrop<string[]>): void {
    if (this.businessPropertiesToShow && this.businessPropertiesToShow.length > 0) {
      moveItemInArray(this.businessPropertiesToShow, evt.previousIndex, evt.currentIndex);
    }
  }

  onChangeFormulaClick(checked: boolean, categoryProperty): void {
    categoryProperty.isFormula = checked;
    categoryProperty.formula = [];
    if (!checked) {
      const body = {
        valueType: categoryProperty.valueType,
        isFormula: 0,
        formula: null,
        orderEnabled: categoryProperty.orderEnabled
      };
      // this.editProperties(categoryProperty.id, body);
    }
  }

  onEditFormulaClick(categoryProperty: any): void {
    this._matDialog.open(FormulaDialogComponent, {
      width: '500px',
      maxHeight: '500px',
      disableClose: true,
      data: {
        categoryProperty,
        categoryProperties: this.categoryProperties.filter(item => !item.default)
      }
    }).afterClosed()
      .pipe(
        filter((res) => res && !!res),
        switchMap(res => this._categoryService.updateCategoryProperties(categoryProperty.id, res))
      )
      .subscribe((res: any) => {
        const propertyIndex = this.categoryPropertiesToShow.findIndex(item => item.id === res.id);
        this.categoryPropertiesToShow[propertyIndex] = res;
      });
  }

  onRemoveFormulaClick(categoryProperty: any): void {
    const body: any = {
      valueType: categoryProperty.valueType,
      enabled: 0,
      isFormula: 0,
      formula: null,
      orderEnabled: 0
    };

    this._categoryService.updateCategoryProperties(categoryProperty.id, body)
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe(() => {
        this.categoryPropertiesToShow = this.categoryPropertiesToShow.filter(item => item.id !== categoryProperty.id);
        this._socketService.emit('category_property_delete', { id: categoryProperty.id });
      });
  }

  onAddCategoryFeatureDialogClick(): void {
    this._matDialog.open(CategoryFeatureDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {
        categoryId: this._categoryId
      }
    }).afterClosed()
      .pipe(
        filter((res) => res && !!res),
        switchMap(res => this._categoryService.addCategoryProperty(res))
      )
      .subscribe((categoryProperty: any) => {
        this.categoryProperties = [...this.categoryProperties, categoryProperty];
        this._toastrService.success(`Категория "${categoryProperty.nameRu}" добавлена`);
      });
  }

  onAddBusinessPropertyDialogClick(): void {
    this._matDialog.open(CategoryBusinessPropertyDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {}
    }).afterClosed()
      .pipe(
        filter((res) => res && !!res),
        switchMap((res: any) => {
          res.category = +this._categoryId;
          return this._categoryService.addCategoryFeaturesBusinessProperty(res);
        })
      )
      .subscribe(res => this.businessProperties = [...this.businessProperties, res]);
  }

  onDestroyCategoryPropertyClick(categoryProperty: any): void {
    this._matDialog.open(ConfirmDeleteComponent, {
      width: '500px',
      disableClose: true,
      data: {}
    }).afterClosed()
      .pipe(
        filter((res) => res && !!res),
        switchMap(() => this._categoryService.destroyCategoryProperties(categoryProperty.id))
      )
      .subscribe(() => {
        this.categoryProperties = this.categoryProperties.filter(item => item.id !== categoryProperty.id);
        this.categoryPropertiesToShow = this.categoryPropertiesToShow.filter(item => item.id !== categoryProperty.id);
      });
  }

  onEditCategoryPropertyClick(categoryProperty: any): void {
    this._matDialog.open(CategoryFeatureDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {
        categoryProperty
      }
    }).afterClosed()
      .pipe(
        filter((res) => res && !!res),
        switchMap(res => this._categoryService.updateCategoryProperties(categoryProperty.id, res))
      )
      .subscribe((res: any) => {
        let propertyIndex = this.categoryPropertiesToShow.findIndex(item => item.id === res.id);

        if (propertyIndex === -1) {
          this.categoryPropertiesToShow = [...this.categoryPropertiesToShow, res];
        } else {
          this.categoryPropertiesToShow[propertyIndex] = res;
          this.categoryPropertiesToShow[propertyIndex].isSpecial = isSpecialCategory(res.special);
        }

        propertyIndex = this.categoryProperties.findIndex(item => item.id === res.id);
        this.categoryProperties[propertyIndex] = res;
      });
  }

  onAddCategoryPropertyClick(categoryProperty: any): void {
    const addedItem = this.categoryPropertiesToShow.find(item => item.id === categoryProperty.id);
    if (addedItem) {
      // TODO show message
    } else {
      const body: any = {
        valueType: categoryProperty.valueType,
        enabled: 1,
        isActiveOnOrderForm: 1,
        orderEnabled: isSpecialCategory(categoryProperty.special) ? 1 : 0,
        special: categoryProperty.special,
        priority: categoryProperty.priority,
        orderPriority: categoryProperty.priority,
      };

      this._categoryService.updateCategoryProperties(categoryProperty.id, body)
        .pipe(takeUntil(this._unsubscribe$))
        .subscribe(() => {
          this.categoryPropertiesToShow = [...this.categoryPropertiesToShow, categoryProperty];
          this._socketService.emit('category_property_create', categoryProperty);
        });
    }
  }

  onDeleteCategoryPropertyFromProducts(categoryProperty: any) {
    this._matDialog.open(PropertyOverrideDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {
        property: categoryProperty,
        isDelete: true
      }
    }).afterClosed().subscribe(() => this._getCategoryFeaturesProperties());
  }

  onOverrideCategoryPropertyFromProducts(categoryProperty: any) {
    this._matDialog.open(PropertyOverrideDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {
        property: categoryProperty,
        forProperty: true,
        isOverride: true
      }
    }).afterClosed().subscribe(() => this._getCategoryFeaturesProperties());
  }

  onJoinCategoryProperties(categoryProperty: any) {
    this._matDialog.open(PropertyJoinDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {
        categoryProperties: this.categoryPropertiesToShow.filter((prop) => +prop.id !== +categoryProperty.id),
        property: categoryProperty
      }
    }).afterClosed().subscribe(() => this._getCategoryFeaturesProperties());
  }

  onDestroyBusinessPropertyClick(categoryProperty: any): void {
    this._categoryService.deleteCategoryFeaturesBusinessProperty(categoryProperty.id)
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe(() => this.businessProperties = this.businessProperties.filter(item => item.id !== categoryProperty.id));
  }

  onEditBusinessPropertyClick(categoryProperty: any): void {
    this._matDialog.open(CategoryBusinessPropertyDialogComponent, {
      width: '500px',
      disableClose: true,
      data: { categoryProperty }
    }).afterClosed()
      .pipe(
        filter((res) => res && !!res),
        switchMap((res: any) => {
          res.category = +this._categoryId;
          return this._categoryService.updateCategoryFeaturesBusinessProperty(categoryProperty.id, res);
        })
      )
      .subscribe();
  }

  onDisableBusinessPropertyClick(property: any): void {
    property.enabled = 0;

    this._categoryService.updateCategoryFeaturesBusinessProperty(property.id, { enabled: property.enabled })
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe(res => {
        this.businessPropertiesToShow = this.businessPropertiesToShow.filter(item => item.id !== property.id);
        this.businessProperties = [...this.businessProperties, res];
      });
  }

  onAddBusinessPropertyClick(property: any): void {
    const addedItem = this.businessPropertiesToShow.find(item => item.id === property.id);

    if (addedItem) {
      // TODO show message
    } else {
      property.enabled = 1;

      this._categoryService.updateCategoryFeaturesBusinessProperty(property.id, { enabled: property.enabled })
        .pipe(takeUntil(this._unsubscribe$))
        .subscribe(res => {
          this.businessProperties = this.businessProperties.filter(item => item.id !== property.id);
          this.businessPropertiesToShow = [...this.businessPropertiesToShow, res];
        });
    }
  }

  private _getCategoryFeaturesBusinessProperties(): void {
    this._categoryService.getCategoryFeaturesBusinessProperties(this._categoryId)
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe((res) => {
        this.businessProperties = res.businessProperties
          .filter(item => !item.enabled)
          .sort((a, b) => a.priority - b.priority);
        this.businessPropertiesToShow = res.businessProperties
          .filter(item => item.enabled)
          .sort((a, b) => a.priority - b.priority);
      });
  }

  private _getCategoryFeaturesProperties(): void {
    this._categoryService.getCategoryFeaturesProperties(this._categoryId)
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe((res: any) => {
        const items = res.categoryProperties;

        items.forEach(item => item.isSpecial = isSpecialCategory(item.special));
        this.categoryProperties = [...this._defaultProperties, ...items];
        this.categoryPropertiesToShow = items
          .filter(item => item.enabled)
          .sort((a, b) => a.priority - b.priority);
      });
  }

}
