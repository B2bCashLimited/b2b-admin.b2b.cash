import { Component, OnInit, Inject } from '@angular/core';
import { ConfigService } from '@b2b/services/config.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { ImportModerates } from 'app/core/models/import-moderates';
import { CategoryService } from '@b2b/services/category.service';
import { first, switchMap, filter, distinctUntilChanged } from 'rxjs/operators';
import { CategoryPropertySummary } from '../../models/category-summary';
import { uniq } from 'lodash';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AddValueDialogComponent } from './add-value-dialog/add-value-dialog.component';

@Component({
  selector: 'b2b-moderate-value-dialog',
  templateUrl: './moderate-value-dialog.component.html',
  styleUrls: ['./moderate-value-dialog.component.scss']
})
export class ModerateValueDialogComponent implements OnInit {

  categoryProperty: CategoryPropertySummary;

  constructor(
    private _config: ConfigService,
    private _dialog: MatDialog,
    private _categoryService: CategoryService,
    public dialogRef: MatDialogRef<ModerateValueDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { item: ImportModerates }
  ) { }

  ngOnInit() {
    this._categoryService.getCategoryProperty(this.data.item.additionalParams.id)
      .pipe(first()).subscribe((categoryProperty: CategoryPropertySummary) => {
        this.categoryProperty = categoryProperty;
      });
  }

  onValueClick(value: any) {
    const body = {
      possibleValuesExt: {
        ...this.categoryProperty.possibleValuesExt
      }
    };
    body.possibleValuesExt[value].push(this.data.item.value);
    body.possibleValuesExt[value] = uniq(body.possibleValuesExt[value]);

    this._categoryService.updateCategoryProperties(this.data.item.additionalParams.id, body).pipe(
      switchMap(() => this._categoryService.updateImportModerates(this.data.item.id))
    ).subscribe(res => {
      this.dialogRef.close();
    });
  }

  onCreateNewClick() {
    this._dialog.open(AddValueDialogComponent, {
      data: {
        item: this.data.item,
        categoryPropertyId: this.data.item.additionalParams.id,
        possibleValues: {
          possibleValuesRu: this.categoryProperty.possibleValuesRu,
          possibleValuesEn: this.categoryProperty.possibleValuesEn,
          possibleValuesCn: this.categoryProperty.possibleValuesCn,
          possibleValuesExt: this.categoryProperty.possibleValuesExt,
        }
      },
      maxWidth: '340px'
    });
  }
}
