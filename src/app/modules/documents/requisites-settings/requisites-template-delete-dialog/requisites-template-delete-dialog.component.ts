import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'b2b-requisites-template-delete-dialog',
  templateUrl: './requisites-template-delete-dialog.component.html',
  styleUrls: ['./requisites-template-delete-dialog.component.scss']
})
export class RequisitesTemplateDeleteDialogComponent implements OnInit {

  data: any;

  constructor(private _matDialogRef: MatDialogRef<RequisitesTemplateDeleteDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private _dialogData: any) {
  }

  ngOnInit(): void {
    this.data = this._dialogData;
  }

  onCloseClicked(bool = false): void {
    this._matDialogRef.close(bool);
  }

}
