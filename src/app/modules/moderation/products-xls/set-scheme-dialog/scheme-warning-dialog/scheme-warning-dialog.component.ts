import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'b2b-scheme-warning-dialog',
  templateUrl: 'scheme-warning-dialog.component.html',
  styleUrls: ['./scheme-warning-dialog.component.scss']
})
export class SchemeWarningDialogComponent {

  constructor(public dialogRef: MatDialogRef<SchemeWarningDialogComponent>) {}

  onContinueClick(): void {
    this.dialogRef.close('ok');
  }
}
