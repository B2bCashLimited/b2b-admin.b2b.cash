import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, PageEvent } from '@angular/material';
import { ImportModerates } from 'app/core/models/import-moderates';
import { ConfigService } from '@b2b/services/config.service';
import { CategoryService } from '@b2b/services/category.service';
import { first, switchMap, filter, take } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';
import { ClearSubscriptions } from '@b2b/decorators';

@ClearSubscriptions()
@Component({
  selector: 'b2b-overrite-property-dialog',
  templateUrl: './overrite-property-dialog.component.html',
  styleUrls: ['./overrite-property-dialog.component.scss']
})
export class OverritePropertyDialogComponent implements OnInit, OnDestroy {
  selectedProperty: any = {};
  items = [];
  pager: PageEvent = {
    length: 0,
    pageIndex: 0,
    pageSize: 0
  };
  loading: boolean;
  _moderateSub: Subscription;

  constructor(
    private _config: ConfigService,
    private _dialog: MatDialog,
    private _categoryService: CategoryService,
    public dialogRef: MatDialogRef<OverritePropertyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { item: ImportModerates, getPropId?: boolean, category?: number }
  ) { }

  ngOnInit() {
    this.loading = true;
    if (this.data.category) {
      this._categoryService.getCategoryFeaturesProperties(this.data.category).pipe(first())
        .subscribe(res => {
          this.loading = false;
          this.pager = {
            pageSize: res.pageSize,
            length: res.pageCount,
            pageIndex: res.page
          };
          this.items = res.categoryProperties;
        });
    } else if (this.data.item.additionalParams.yandex_id) {
      this._categoryService.getCategoryPropertiesByYandexId(this.data.item.additionalParams.yandex_id).pipe(first())
        .subscribe(({ data, pager }) => {
          this.loading = false;
          this.loading = false;
          this.pager = {
            pageSize: pager.perPage,
            length: pager.totalItems,
            pageIndex: pager.currentPage
          };
          this.items = data;
        });
    } else {
      this._categoryService.getCategoryFeaturesProperties(this.data.item.categoryId).pipe(first())
        .subscribe(res => {
          this.loading = false;
          this.pager = {
            pageSize: res.pageSize,
            length: res.pageCount,
            pageIndex: res.page
          };
          this.items = res.categoryProperties;
        });
    }
  }

  onPropertyClick(property) {
    this.selectedProperty = property;
  }

  override() {
    if (this.data.getPropId) {
      this.dialogRef.close(this.selectedProperty);
      return;
    }
    if (this.data.item.additionalParams.yandex_id) {
      this._moderateSub = this._categoryService.updateCategoryProperties(this.selectedProperty.id, {
        yandexPropertyName: this.data.item.value
      }).pipe(
        switchMap(res => {
          if (res) {
            return this._categoryService.updateImportModerates(this.data.item.id);
          }
          return of(null);
        })
      ).subscribe(res => {
        if (res) {
          this._dialog.closeAll();
        }
      });
    } else {
      const data = {
        moderate: this.data.item.id,
        type: this.data.item.type,
        bindId: this.selectedProperty.id,
        task: this.data.item.taskId
      };
      this._moderateSub = this._categoryService.moderateFeedItems(data)
        .pipe(
          switchMap(res => this._categoryService.updateImportModerates(this.data.item.id))
        ).subscribe(res => {
          if (res) {
            this._dialog.closeAll();
          }
        }, () => this._config.showSnackBar$.next({ message: 'Что-то пошло не так' }));
    }
  }

  ngOnDestroy() {
  }

}
