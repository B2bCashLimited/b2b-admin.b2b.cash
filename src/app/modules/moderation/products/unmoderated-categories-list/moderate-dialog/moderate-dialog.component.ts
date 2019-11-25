import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material';
import { ImportModerates } from 'app/core/models/import-moderates';
import { TreeComponent } from '@b2b/shared/modules';
import { switchMap } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';
import { CategoryService } from '@b2b/services/category.service';
import { ConfigService } from '@b2b/services/config.service';
import { CreateCategoryDialogComponent } from '../create-category-dialog/create-category-dialog.component';

@Component({
  selector: 'b2b-moderate-dialog',
  templateUrl: './moderate-dialog.component.html',
  styleUrls: ['./moderate-dialog.component.scss']
})
export class ModerateDialogComponent implements OnInit, OnDestroy {
  category: any;
  _catSub: Subscription;

  constructor(
    private _config: ConfigService,
    private _dialog: MatDialog,
    private _categoryService: CategoryService,
    private _dialogRef: MatDialogRef<ModerateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { item: ImportModerates, isModerateName: boolean }
  ) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.unsub();
  }

  overrideYandexCategory() {
    this.unsub();
    this._catSub = this._dialog.open(TreeComponent, {
      width: '800px',
      data: {
        multiple: false,
        category: this.category
      }
    }).afterClosed()
      .pipe(
        switchMap(selectedCategory => {
          this.category = selectedCategory;
          if (selectedCategory) {
            return this._categoryService.updateCategory(selectedCategory.id, {
              yandexCategoryId: this.data.item.additionalParams.yandex_id
            });
          }
          return of(null);
        }),
        switchMap(res => {
          if (res) {
            return this._categoryService.updateImportModerates(this.data.item.id);
          }
          return of(null);
        })
      ).subscribe(res => {
        if (res) {
          this._config.showSnackBar$.next({ message: 'Категория переопределена!' });
          this._dialog.closeAll();
        }
      });
  }

  overriteFeedItem() {
    this.unsub();
    this._catSub = this._dialog.open(TreeComponent, {
      width: '800px',
      data: {
        multiple: false,
        category: this.category
      }
    }).afterClosed()
      .pipe(
        switchMap(selectedCategory => {
          if (selectedCategory) {
            const body = {
              moderate: this.data.item.id,
              type: this.data.item.type,
              bindId: selectedCategory.id,
              task: this.data.item.taskId
            };
            return this._categoryService.moderateFeedItems(body);
          }
          return of(null);
        }),
        switchMap(res => {
          if (res) {
            return this._categoryService.updateImportModerates(this.data.item.id);
          }
          of(null);
        })
      ).subscribe(res => {
        if (res) {
          this._config.showSnackBar$.next({ message: 'Категория переопределена!' });
          this._dialog.closeAll();
        }
      });
  }

  selectCategory() {
    this.unsub();
    this._catSub = this._dialog.open(TreeComponent, {
      width: '800px',
      data: {
        multiple: false,
        category: this.category
      }
    }).afterClosed().subscribe(res => {
      if (res) {
        this._config.showSnackBar$.next({ message: 'Категория выброна!' });
        this._dialogRef.close(res);
      }
    });
  }

  onOverriteClick() {
    if (this.data.item) {
      if (+this.data.item.type === 1) {
        this.overrideYandexCategory();
      } else if (+this.data.item.type === 5) {
        this.overriteFeedItem();
      }
    } else if (this.data.isModerateName) {
      this.selectCategory();
    }
  }

  onCreateNewClick() {
    if (this.data.item) {
      if (+this.data.item.type === 1) {
        this.createWithYandex();
      } else if (+this.data.item.type === 5) {
        this.createFeedItem();
      }
    } else if (this.data.isModerateName) {
      this.createForModerateName();
    }
  }

  createWithYandex() {
    this._dialog.open(CreateCategoryDialogComponent, {
      maxHeight: '90vh',
      maxWidth: '90vw'
    }).afterClosed().pipe(
      switchMap(selectedCategory => {
        this.category = selectedCategory;
        if (selectedCategory) {
          return this._categoryService.updateCategory(selectedCategory.id, {
            yandexCategoryId: this.data.item.additionalParams.yandex_id
          });
        }
        return of(null);
      }),
      switchMap(res => {
        if (res) {
          return this._categoryService.updateImportModerates(this.data.item.id);
        }
        return of(null);
      })
    ).subscribe(res => {
      if (res) {
        this._config.showSnackBar$.next({ message: 'Новая категория создана!' });
      }
    });
  }

  createFeedItem() {
    this._dialog.open(CreateCategoryDialogComponent, {
      maxHeight: '90vh',
      maxWidth: '90vw'
    }).afterClosed().pipe(
      switchMap(selectedCategory => {
        if (selectedCategory) {
          const body = {
            moderate: this.data.item.id,
            type: this.data.item.type,
            bindId: selectedCategory.id,
            task: this.data.item.taskId
          };
          return this._categoryService.moderateFeedItems(body);
        }
        return of(null);
      }),
      switchMap(res => {
        if (res) {
          return this._categoryService.updateImportModerates(this.data.item.id);
        }
        of(null);
      })
    ).subscribe(res => {
      if (res) {
        this._config.showSnackBar$.next({ message: 'Новая категория создана!' });
      }
    });
  }

  createForModerateName() {
    this._dialog.open(CreateCategoryDialogComponent, {
      maxHeight: '90vh',
      maxWidth: '90vw'
    }).afterClosed().subscribe(res => {
      if (res) {
        this._config.showSnackBar$.next({ message: 'Новая категория создана!' });
        this._dialogRef.close(res);
      }
    });
  }

  private unsub() {
    if (this._catSub && !this._catSub.closed) {
      this._catSub.unsubscribe();
    }
  }
}
