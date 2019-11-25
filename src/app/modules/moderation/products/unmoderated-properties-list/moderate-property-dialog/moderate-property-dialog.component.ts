import { Component, OnInit, Inject } from '@angular/core';
import { ConfigService } from '@b2b/services/config.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, PageEvent } from '@angular/material';
import { CategoryService } from '@b2b/services/category.service';
import { ImportModerates } from 'app/core/models/import-moderates';
import { first, switchMap, filter, take } from 'rxjs/operators';
import { Subscription, of, Observable } from 'rxjs';
import { OverritePropertyDialogComponent } from './overrite-property-dialog/overrite-property-dialog.component';
import { CategoryFeatureDialogComponent } from '@b2b/shared/components/category-feature-dialog/category-feature-dialog.component';
import { Category } from '@b2b/models';
import { TreeComponent } from '@b2b/shared/modules';

@Component({
  selector: 'b2b-moderate-property-dialog',
  templateUrl: './moderate-property-dialog.component.html',
  styleUrls: ['./moderate-property-dialog.component.scss']
})
export class ModeratePropertyDialogComponent implements OnInit {

  category: any;
  _catSub: Subscription;
  items = [];
  pager: PageEvent = {
    length: 0,
    pageIndex: 0,
    pageSize: 0
  };

  constructor(
    private _config: ConfigService,
    private _dialog: MatDialog,
    private _categoryService: CategoryService,
    public dialogRef: MatDialogRef<ModeratePropertyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { item: ImportModerates }
  ) { }

  ngOnInit() {
  }

  onOverriteClick() {
    if (+this.data.item.type === 2) {
      this.overriteYandex();
    }
    if (+this.data.item.type === 6) {
      this.overriteFeedItem();
    }
  }

  overriteYandex() {
    // yandexPropertyName
    this.unsub();
    this._catSub = this._dialog.open(OverritePropertyDialogComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: { item: this.data.item }
    }).afterClosed()
      .pipe(
        switchMap(res => {
          if (res) {
            return this._categoryService.updateImportModerates(this.data.item.id);
          }
          return of(null);
        }))
      .subscribe(res => {
        if (res) {
          this._config.showSnackBar$.next({ message: 'Характеристика переопределена!' });
        }
      });
  }

  overriteFeedItem() {
    this.unsub();
    let request: Observable<any>;
    if (this.data.item && this.data.item.categoryId) {
      request = this._dialog.open(OverritePropertyDialogComponent, {
        width: '800px',
        maxHeight: '90vh',
        data: { item: this.data.item }
      }).afterClosed().pipe(take(1));
    } else {
      request = this._dialog.open(TreeComponent, {
        width: '800px',
        data: {
          multiple: false
        }
      }).afterClosed().pipe(
        switchMap((selectedCategory) => {
          if (selectedCategory) {
            return this._dialog.open(OverritePropertyDialogComponent, {
              width: '800px',
              maxHeight: '90vh',
              data: {
                item: this.data.item,
                category: +selectedCategory.id
              }
            }).afterClosed().pipe(take(1));
          }
          return of(null);
        }));
    }

    this._catSub = request.subscribe((res) => {
      if (res) {
        this._config.showSnackBar$.next({ message: 'Характеристика переопределена!' });
      }
    });
  }

  onCreateNewClick() {
    if (this.data.item.additionalParams.yandex_id) {
      this._categoryService.getCategoryByYandexId(this.data.item.additionalParams.yandex_id).pipe(first())
        .subscribe((res: Category) => {
          this.newPropertyYandexHandle(res.id);
        });
    } else {
      this.newPropertyFeedHandle(this.data.item.categoryId);
    }
  }

  newPropertyYandexHandle(categoryId) {
    this._dialog.open(CategoryFeatureDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {
        yandexPropertyName: this.data.item.value,
        categoryId
      }
    }).afterClosed()
      .pipe(
        filter((res) => res && !!res),
        switchMap(res => this._categoryService.addCategoryProperty(res)),
        switchMap(res => {
          if (res) {
            return this._categoryService.updateImportModerates(this.data.item.id);
          }
          return of(null);
        })
      )
      .subscribe((categoryProperty: any) => {
        if (categoryProperty) {
          this._config.showSnackBar$.next({ message: 'Характеристика создана!' });
        }
      });
  }

  newPropertyFeedHandle(categoryId) {
    this._dialog.open(CategoryFeatureDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {
        yandexPropertyName: this.data.item.value,
        categoryId
      }
    }).afterClosed()
      .pipe(
        filter((res) => res && !!res),
        switchMap(res => this._categoryService.addCategoryProperty(res)),
        switchMap((res: any) => {
          if (res) {
            const body = {
              moderate: this.data.item.id,
              type: this.data.item.type,
              bindId: res.id,
              task: this.data.item.taskId
            };
            return this._categoryService.moderateFeedItems(body);
          }
          return of(null);
        })
      )
      .subscribe((categoryProperty: any) => {
        if (categoryProperty) {
          this._config.showSnackBar$.next({ message: 'Характеристика создана!' });
        }
      });
  }

  private unsub() {
    if (this._catSub && !this._catSub.closed) {
      this._catSub.unsubscribe();
    }
  }
}
