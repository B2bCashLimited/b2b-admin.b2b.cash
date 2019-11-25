import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'b2b-add-user-dialog',
  templateUrl: './add-user-dialog.component.html',
  styleUrls: ['./add-user-dialog.component.scss']
})
export class AddUserDialogComponent implements OnInit {

  formGroup: FormGroup;

  constructor(
    private _matDialogRef: MatDialogRef<AddUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private _dialogData: any,
    private _formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.formGroup = this._formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
      firstName: [null, [Validators.required]],
      lastName: [null, [Validators.required]],
      middleName: null,
      password: [null, [Validators.required]],
      phone: [null, [Validators.required]],
    });
  }

  onCloseClick(add: boolean): void {
    if (add) {
      this._matDialogRef.close({
        ...this.formGroup.value,
        username: this.formGroup.value.email,
        status: false,
      });
    } else {
      this._matDialogRef.close(null);
    }
  }
}
