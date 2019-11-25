import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'b2b-confirm-delete-employee-dialog',
  templateUrl: './confirm-delete-employee-dialog.component.html',
  styleUrls: ['./confirm-delete-employee-dialog.component.scss']
})
export class ConfirmDeleteEmployeeDialogComponent implements OnInit {

  constructor(
    private _matDialogRef: MatDialogRef<ConfirmDeleteEmployeeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private _dialogData: any) {
  }

  ngOnInit() {
  }

  onCloseClick(value: boolean): void {
    this._matDialogRef.close(value);
  }

}
