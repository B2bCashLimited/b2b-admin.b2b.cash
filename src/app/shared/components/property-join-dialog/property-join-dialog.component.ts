import { Component, Inject, OnDestroy, OnInit, } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { CategoryService } from '@b2b/services/category.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'b2b-property-join-dialog',
  templateUrl: './property-join-dialog.component.html',
  styleUrls: ['./property-join-dialog.component.scss']
})
export class PropertyJoinDialogComponent implements OnInit, OnDestroy {

  property: any;
  categoryPropertyTo;
  dataModel = {};
  dataSource = [];
  private _unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PropertyJoinDialogComponent>,
    private _categoryService: CategoryService) {
    this.property = this.data.property;
  }

  /**
   * OnInit lifecycle hook implementation
   */
  ngOnInit() {
    this.dataSource = this.data.categoryProperties;
  }

  trackByFn(index, item) {
    return item && item.id || index;
  }
  /**
   * OnDestroy lifecycle hook implementation
   */
  ngOnDestroy() {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }

  onJoinClick() {
    const body = {
      categoryPropertyFrom: this.property.id,
      categoryPropertyTo: this.categoryPropertyTo
    };

    this._categoryService.mergeProductProperties(body).subscribe(() => this.dialogRef.close());
  }
}
