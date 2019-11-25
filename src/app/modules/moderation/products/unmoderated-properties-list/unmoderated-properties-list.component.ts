import { Component, OnInit, OnDestroy } from '@angular/core';
import { ImportModerates } from 'app/core/models/import-moderates';
import { PageEvent, MatDialog } from '@angular/material';
import { CategoryService } from '@b2b/services/category.service';
import { ModeratePropertyDialogComponent } from './moderate-property-dialog/moderate-property-dialog.component';
import { Subscription } from 'rxjs';
import { ClearSubscriptions } from '@b2b/decorators';
import { first, switchMap } from 'rxjs/operators';

@ClearSubscriptions()
@Component({
  selector: 'b2b-unmoderated-properties-list',
  templateUrl: './unmoderated-properties-list.component.html',
  styleUrls: ['./unmoderated-properties-list.component.scss']
})
export class UnmoderatedPropertiesListComponent implements OnInit, OnDestroy {

  items: ImportModerates[] = [];
  pager: PageEvent = {
    length: 0,
    pageIndex: 0,
    pageSize: 0
  };
  private _delSub: Subscription;
  private _declineSub: Subscription;

  constructor(
    private _categoryService: CategoryService,
    private _matDialog: MatDialog
  ) { }

  ngOnInit() {
    this.getUnmoderatedCategories([2, 6]);
    this._delSub = this._categoryService.deleteModerated.subscribe(id => {
      this.getUnmoderatedCategories([2, 6]);
    });
  }

  ngOnDestroy() { }

  private getUnmoderatedCategories(type: number[]) {
    const query = { type, status: 1 };
    this._categoryService.getImportModerates(query)
      .pipe(first())
      .subscribe(({ pager, data }) => {
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
    this._matDialog.open(ModeratePropertyDialogComponent, {
      data: { item },
      autoFocus: false
    });
  }

  onDeclineClick(evt: Event, item: ImportModerates) {
    evt.stopPropagation();
    this._declineSub = this._categoryService.putImportModerates(item.id, { status: 4 })
      .pipe(
        switchMap((res) => this._categoryService.updateImportModerates(item.id))
      ).subscribe();
  }
}
