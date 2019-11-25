import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'b2b-global-error-dialog',
  templateUrl: './global-error-dialog.component.html',
  styleUrls: ['./global-error-dialog.component.scss']
})
export class GlobalErrorDialogComponent implements OnInit {
  errorData: any;

  constructor(
    private _matDialogRef: MatDialogRef<GlobalErrorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private _dialogData: any) {
  }

  ngOnInit() {
    this.errorData = this._dialogData.errorData;
  }

  onCloseClick(): void {
    this._matDialogRef.close();
  }
}
