import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'b2b-unit-dialog',
  templateUrl: './unit-dialog.component.html',
  styleUrls: ['./unit-dialog.component.scss']
})
export class UnitDialogComponent implements OnInit {
  formGroup: FormGroup;
  isEditMode = false;

  constructor(
    private _matDialogRef: MatDialogRef<UnitDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private _dialogData: any,
    private _formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.formGroup = this._formBuilder.group({
      nameRu: [null, [Validators.required]],
      nameEn: [null, [Validators.required, Validators.pattern(/[\u0000-~]+/ig)]],
      nameCn: [null, [Validators.required]],
      controlUnitType: [null, [Validators.required]],
    });
    if (this._dialogData.unit) {
      this.isEditMode = true;
      this.formGroup.patchValue(this._dialogData.unit);
    } else if (this._dialogData.controlUnitType) {
      this.formGroup.get('controlUnitType').patchValue(this._dialogData.controlUnitType);
    }
  }

  onCloseClick(add: boolean): void {
    this._matDialogRef.close(add ? this.formGroup.value : null);
  }

}
