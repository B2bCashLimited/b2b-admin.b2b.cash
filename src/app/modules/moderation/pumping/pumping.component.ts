import { Component, OnDestroy, OnInit } from '@angular/core';
import { CategoryService } from '@b2b/services/category.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { filter, switchMap } from 'rxjs/operators';
import { MatDialog, PageEvent } from '@angular/material';
import { ConfirmDestroyDialogComponent } from './dialogs/confirm-destroy-dialog/confirm-destroy-dialog.component';
import { SocketService } from '@b2b/services/socket.service';
import { ClearSubscriptions } from '@b2b/decorators';

@ClearSubscriptions()
@Component({
  selector: 'b2b-pumping',
  templateUrl: './pumping.component.html',
  styleUrls: ['./pumping.component.scss']
})
export class PumpingComponent implements OnInit, OnDestroy {
  formGroup: FormGroup;
  pageSize = 0;
  pageCount = 0;
  length = 0;
  categories: any[] = [];
  totalNotModeratedCounter = 0;
  openedCategoryId = null;
  
  constructor(
    private _categoryService: CategoryService,
    private _socketService: SocketService,
    private _formBuilder: FormBuilder,
    private _matDialog: MatDialog) {
  }
  
  /**
   * @InheritDoc
   */
  ngOnInit() {
    this.formGroup = this._formBuilder.group({
      categoryId: null,
      searchKey: null,
      searchBySeen: false,
      searchByNotSeen: true
    });
    this.subscribeCategories();
  }
  
  /**
   * @InheritDoc
   */
  ngOnDestroy(): void {
    this.unsubscribeCategories();
  }
  
  getPage(pageEvent: PageEvent): void {
    /*const pageIndex = pageEvent.pageIndex + 1;
    this._currentPage = pageIndex <= this.pageCount ? Math.min(pageIndex, this.pageCount) : 1;
    if (this._categorySub && !this._categorySub.closed) {
      this._categorySub.unsubscribe();
    }
    this._categorySub = this.getPumpingCategories(this.formGroup.value, this._currentPage).subscribe();*/
  }
  
  onDestroyCategoryClick(evt: MouseEvent, currentCategory: any) {
    evt.stopPropagation();
    this._matDialog.open(ConfirmDestroyDialogComponent, {
      width: '500px',
      height: '210px',
      disableClose: true,
      data: { currentCategory },
    }).afterClosed()
      .pipe(
        filter((res) => res && !!res),
        switchMap(() => this._categoryService.destroyCategory(currentCategory.id))
      ).subscribe(res => {
      if (res && res.status !== 500) {
        this.categories = this.categories.filter(category => category.id !== currentCategory.id);
      }
    });
  }
  
  /**
   * Changes category moderate view status
   */
  changeCategoryModerateStatus(currentCategory: any): void {
    this.openedCategoryId = null;
    
    if (!currentCategory.viewedByModerator) {
      this._categoryService.changeCategoryModerateStatus({id: currentCategory.id})
        .subscribe((res: {result: boolean}) => {
          if (res.result) {
            const currCategory = this.categories.find(category => category.id === currentCategory.id);
            
            if (Object.keys(currCategory).length) {
              currCategory.viewedByModerator = true;
            }
            
            this.countUnmoderatedCategories(this.categories);
          }
        });
    }
  }
  
  /**
   * Connects current user and subscribes to pumping categories
   */
  private subscribeCategories(): void {
    this._socketService.emit('moderator_pumping_subscribe', {});
    
    /**
     * Listener to get pumping categories
     */
    this._socketService.on('not_moderated_pumping', (data: any) => this.getPumpingCategories(data));
    
  }
  
  /**
   * Unsubscribes current user and disconnects
   */
  private unsubscribeCategories(): void {
    this._socketService.emit('moderator_pumping_unsubscribe', {});
  }
  
  /**
   * Retrieves pumping categories
   */
  private getPumpingCategories(data: any[]): void {
    /*this.pageSize = res.pageSize;
    this.pageCount = res.pageCount;
    this.length = res.pageCount * res.pageSize;*/
    this.categories = data || [];
    this.countUnmoderatedCategories(data);
  }
  
  /**
   * Emits every time category expands
   */
  onCategoryExpanded(categoryId): void {
    this.openedCategoryId = categoryId;
  }
  
  /**
   * Checks category expand state
   */
  private isExpanded(categoryId) {
    return this.openedCategoryId === categoryId;
  }
  
  /**
   * Counts unmoderated categories
   */
  private countUnmoderatedCategories(data: any[]): void {
    this.totalNotModeratedCounter = data.filter(item => !item.viewedByModerator).length;
  }
}
