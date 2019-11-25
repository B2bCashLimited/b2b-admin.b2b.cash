import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'b2b-no-requisites',
  templateUrl: './no-requisites.component.html',
  styleUrls: ['./no-requisites.component.scss']
})
export class NoRequisitesComponent {

  constructor(
    private _matDialogRef: MatDialogRef<NoRequisitesComponent>,
    @Inject(MAT_DIALOG_DATA) public _dialogData: any) {
  }

  onCloseClick(): void {
    this._matDialogRef.close();
  }

}
