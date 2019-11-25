import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'b2b-success-save-date',
  templateUrl: './success-save-date.component.html',
  styleUrls: ['./success-save-date.component.scss']
})
export class SuccessSaveDateComponent {

  constructor(private _matDialogRef: MatDialogRef<SuccessSaveDateComponent>) {
  }

  onCloseClick(): void {
    this._matDialogRef.close();
  }

}
