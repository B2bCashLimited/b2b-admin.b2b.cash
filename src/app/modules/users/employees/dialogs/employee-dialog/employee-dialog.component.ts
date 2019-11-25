import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {UsersService} from '../../../users.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'b2b-employee-dialog',
  templateUrl: './employee-dialog.component.html',
  styleUrls: ['./employee-dialog.component.scss']
})
export class EmployeeDialogComponent implements OnInit {

  formGroup: FormGroup;
  roles;
  isEditMode = false;
  roles$: Observable<any>;

  constructor(
    private _usersService: UsersService,
    private _matDialogRef: MatDialogRef<EmployeeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private _dialogData: any,
    private _formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.roles$ = this._usersService.getAdminPositions();
    this.formGroup = this._formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
      firstName: [null, [Validators.required]],
      lastName: [null, [Validators.required]],
      middleName: null,
      password: [null, [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(16)
      ]],
      phone: [null, [Validators.required]],
      adminLevel: [null, [Validators.required]],
      adminPosition: [null, [Validators.required]],
      isB2bEmployee: 1,
    });
    const employee = this._dialogData.employee;
    if (employee) {
      this.isEditMode = true;
      this.formGroup.get('password').clearValidators();
      this.formGroup.get('password').updateValueAndValidity();
      if (employee.adminLevel !== 2) {
        this.formGroup.get('adminPosition').disable();
      }
      this.formGroup.patchValue(employee);
    }
    this.formGroup.get('adminLevel').valueChanges
      .subscribe((value) => {
        if (value === 1) {
          this.formGroup.get('adminPosition').disable();
          this.formGroup.get('adminPosition').clearValidators();
          this.formGroup.get('adminPosition').updateValueAndValidity();
        } else {
          this.formGroup.get('adminPosition').enable();
          this.formGroup.get('adminPosition').setValidators(Validators.required);
          this.formGroup.get('adminPosition').updateValueAndValidity();
        }
      });
  }

  onCloseClick(accept: boolean): void {
    if (accept && this._dialogData.employee) {
      this._matDialogRef.close({
        ...this.formGroup.value,
        username: this.formGroup.get('email').value,
      });
    } else if (accept) {
      this._matDialogRef.close({
        ...this.formGroup.value,
        username: this.formGroup.value.email,
        client: 'front',
        status: false,
      });
    } else {
      this._matDialogRef.close(null);
    }
  }
}
