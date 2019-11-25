import { Component, Inject, OnDestroy, OnInit, } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { CategoryService } from '@b2b/services/category.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'b2b-property-override-dialog',
  templateUrl: './property-override-dialog.component.html',
  styleUrls: ['./property-override-dialog.component.scss']
})
export class PropertyOverrideDialogComponent implements OnInit, OnDestroy {

  overrideValue: any;
  property: any;
  isOverride = false;
  isDelete = false;
  columnsToDisplay: string[] = ['name', 'count', 'check'];
  dataModel = {};
  dataSource = [];
  private _unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PropertyOverrideDialogComponent>,
    private _categoryService: CategoryService) {
    this.overrideValue = this.data.overrideValue;
    this.property = this.data.property;
    this.isOverride = this.data.isOverride;
    this.isDelete = this.data.isDelete;
  }

  /**
   * OnInit lifecycle hook implementation
   */
  ngOnInit() {
    this.getProductsByCharacter();
  }


  uncheckeAll() {
    this.dataSource.forEach((item) => {
      item.check = false;
    });
  }

  /**
   * OnDestroy lifecycle hook implementation
   */
  ngOnDestroy() {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }

  getProductsByCharacter() {
    this._categoryService.getCountInProductProperty(+this.property.id)
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe((data: any[]) => {
        this.dataSource = data.map((item) => {
          item.name = item.value;
          item.check = false;
          return item;
        });
      });
  }

  onOverrideClick() {
    if (this.data.forProperty) {
      const body = {
        categoryProperty: +this.property.id,
        categoryPropertyValues: this.dataSource.filter((item) => item.check).map((item) => item.value)
      };

      this._categoryService.overrideProductPropertyValue(body).subscribe(() => this.dialogRef.close());
    } else {
      const body = {
        categoryProperty: +this.property.id,
        oldValues: this.dataSource.filter((item) => item.check).map((item) => item.value),
        newValues: this.overrideValue
      };

      this._categoryService.overrideProductProperty(body).subscribe(() => this.dialogRef.close());
    }

  }

  onDeleteClick() {
    const body = {
      categoryProperty: +this.property.id,
      values: this.dataSource.filter((item) => item.check).map((item) => item.value)
    };

    this._categoryService.removeProductProperties(body).subscribe(() => this.dialogRef.close());
  }
}
