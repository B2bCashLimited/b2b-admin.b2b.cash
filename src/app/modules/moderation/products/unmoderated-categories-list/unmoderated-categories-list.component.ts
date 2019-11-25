import { Component, OnInit, OnDestroy } from '@angular/core';
import { CategoryService } from '@b2b/services/category.service';
import { PageEvent, MatDialog } from '@angular/material';
import { ImportModerates } from 'app/core/models/import-moderates';
import { ModerateDialogComponent } from './moderate-dialog/moderate-dialog.component';
import { Subscription } from 'rxjs';
import { ClearSubscriptions } from '@b2b/decorators';
import { first } from 'rxjs/operators';

@ClearSubscriptions()
@Component({
  selector: 'b2b-unmoderated-categories-list',
  templateUrl: './unmoderated-categories-list.component.html',
  styleUrls: ['./unmoderated-categories-list.component.scss']
})
export class UnmoderatedCategoriesListComponent implements OnInit, OnDestroy {

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
    this.getUnmoderatedCategories([1, 5]);
    this._delSub = this._categoryService.deleteModerated.subscribe(id => {
      this.getUnmoderatedCategories([1, 5]);
    });
  }

  ngOnDestroy() { }

  private getUnmoderatedCategories(type: number[]) {
    const query = { type, status: 1 };
    this._categoryService.getUnmoderatedCategories(query)
      .subscribe(({ data, pager }) => {
        this.pager = {
          pageSize: pager.perPage,
          length: pager.totalItems,
          pageIndex: pager.currentPage
        };
        this.items = data;
      });
  }

  onPageChange(evt) {
  }

  onCategoryClick(item: ImportModerates) {
    this._matDialog.open(ModerateDialogComponent, {
      data: { item },
      autoFocus: false
    });
  }

  onDeclineClick(evt: Event, item: ImportModerates) {
    evt.stopPropagation();
    this._declineSub = this._categoryService.putImportModerates(item.id, { status: 3 })
      .pipe(first()).subscribe();
  }
}
