import { Component, OnInit, Inject, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ConfigService } from '@b2b/services/config.service';
import { CategoryService } from '@b2b/services/category.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { distinctUntilChanged, filter, first, switchMap } from 'rxjs/operators';
import { uniqBy, uniq } from 'lodash';
import { ImportModerates } from 'app/core/models/import-moderates';
import { Subscription } from 'rxjs';
import { ClearSubscriptions } from '@b2b/decorators';

@ClearSubscriptions()
@Component({
  selector: 'b2b-add-value-dialog',
  templateUrl: './add-value-dialog.component.html',
  styleUrls: ['./add-value-dialog.component.scss']
})
export class AddValueDialogComponent implements OnInit, OnDestroy {

  @ViewChild('firstInput') firstInput: ElementRef;
  form: FormGroup;
  sameForEnAndCn = false;
  _sub: Subscription;
  _formSub: Subscription;
  constructor(
    private _config: ConfigService,
    private _dialog: MatDialog,
    private _categoryService: CategoryService,
    public dialogRef: MatDialogRef<AddValueDialogComponent>,
    private _fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: {
      item: ImportModerates,
      categoryPropertyId: number,
      possibleValues: {
        possibleValuesRu: any,
        possibleValuesEn: any,
        possibleValuesCn: any,
        possibleValuesExt: any,
      }
    }
  ) { }

  ngOnInit() {
    this.form = this._fb.group({
      Ru: [null, Validators.required],
      En: [null, Validators.required],
      Cn: [null, Validators.required],
    });

    this._formSub = this.form.valueChanges.pipe(
      distinctUntilChanged(),
      filter(() => this.sameForEnAndCn)
    ).subscribe(val => {
      this.form.get('Ru').setValue(val.En, { emitEvent: false });
      this.form.get('Cn').setValue(val.En, { emitEvent: false });
    });
  }

  onCheckboxChange() {
    this.form.get('En').updateValueAndValidity();
    this.firstInput.nativeElement.focus();
  }

  addNewValue() {
    if (this.form.invalid) {
      this._config.showSnackBar$.next({ message: 'Не все поля заполнены' });
      return;
    }

    const body = {
      possibleValuesRu: this.data.possibleValues.possibleValuesRu,
      possibleValuesEn: this.data.possibleValues.possibleValuesEn,
      possibleValuesCn: this.data.possibleValues.possibleValuesCn,
      possibleValuesExt: this.data.possibleValues.possibleValuesExt
    };
    Object.keys(this.form.value).forEach(key => {
      body['possibleValues' + key] = uniqBy([
        ...body['possibleValues' + key],
        { display: this.form.value[key], value: this.form.value[key] }
      ], 'value');
    });
    body.possibleValuesExt[this.form.value.En] = uniq(Object.keys(this.form.value).map(key => this.form.value[key]));

    this._sub = this._categoryService.updateCategoryProperties(this.data.categoryPropertyId, body)
      .pipe(
        switchMap(() => this._categoryService.updateImportModerates(this.data.item.id))
      )
      .subscribe(() => this._dialog.closeAll());
  }

  ngOnDestroy() {
  }
}
