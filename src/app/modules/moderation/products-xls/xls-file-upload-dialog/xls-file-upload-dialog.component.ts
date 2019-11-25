import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'b2b-xls-file-upload-dialog',
  templateUrl: 'xls-file-upload-dialog.component.html',
  styleUrls: ['./xls-file-upload-dialog.component.scss']
})
export class XlsFileUploadDialogComponent {

  constructor(public dialogRef: MatDialogRef<XlsFileUploadDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {}

  onContinueClick(): void {
    this.dialogRef.close('ok');
  }
}
