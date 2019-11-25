import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'b2b-set-bonus-dialog',
  templateUrl: './set-bonus-dialog.component.html',
  styleUrls: ['./set-bonus-dialog.component.scss']
})
export class SetBonusDialogComponent {

  amount = 1;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private _matDialogRef: MatDialogRef<SetBonusDialogComponent>
  ) {
  }

  close(save: boolean): void {
    this._matDialogRef.close(save ? this.amount : null);
  }

}
