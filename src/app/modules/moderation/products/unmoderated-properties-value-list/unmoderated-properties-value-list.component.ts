import { Component, OnInit, OnDestroy } from '@angular/core';
import { ImportModerates } from 'app/core/models/import-moderates';
// tslint:disable-next-line:max-line-length
import { ModeratePropertyDialogComponent } from '../unmoderated-properties-list/moderate-property-dialog/moderate-property-dialog.component';
import { MatDialog, PageEvent } from '@angular/material';
import { CategoryService } from '@b2b/services/category.service';
import { Subscription } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';
import { ModerateValueDialogComponent } from './moderate-value-dialog/moderate-value-dialog.component';
import { CategoryPropertySummary } from '../models/category-summary';
import { uniq } from 'lodash';
import { ClearSubscriptions } from '@b2b/decorators';

@ClearSubscriptions()
@Component({
  selector: 'b2b-unmoderated-properties-value-list',
  templateUrl: './unmoderated-properties-value-list.component.html',
  styleUrls: ['./unmoderated-properties-value-list.component.scss']
})
export class UnmoderatedPropertiesValueListComponent implements OnInit, OnDestroy {

  items: ImportModerates[] = [];
  pager: PageEvent = {
    length: 0,
    pageIndex: 0,
    pageSize: 0
  };
  _delSub: Subscription;
  _declineSub: Subscription;

  constructor(
    private _categoryService: CategoryService,
    private _matDialog: MatDialog
  ) { }

  ngOnInit() {
    this.getUnmoderatedCategories([8]);
    this._delSub = this._categoryService.deleteModerated.subscribe(id => {
      this.getUnmoderatedCategories([8]);
    });
  }

  ngOnDestroy() { }

  private getUnmoderatedCategories(type: number[]) {
    const query = { type, status: 1 };
    this._categoryService.getUnmoderatedCategories(query)
      .pipe(first())
      .subscribe(({ data, pager }) => {
        this.pager = {
          pageSize: pager.perPage,
          length: pager.totalItems,
          pageIndex: pager.currentPage
        };
        this.items = data;
      });
  }

  onCategoryClick(item: ImportModerates) {
    this._matDialog.open(ModerateValueDialogComponent, {
      data: { item },
      autoFocus: false
    });
  }

  onDeclineClick(evt: Event, item: ImportModerates) {
    evt.stopPropagation();
    this._declineSub = this._categoryService.getCategoryProperty(item.additionalParams.id)
      .pipe(
        switchMap((categoryProperty: CategoryPropertySummary) => {
          return this._categoryService.updateCategoryProperties(item.additionalParams.id, {
            ignoredValues: uniq([...categoryProperty.ignoredValues, item.value])
          });
        }),
        switchMap(() => this._categoryService.updateImportModerates(item.id))
      ).subscribe();
  }
}
