import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'b2b-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements OnInit {
  categoryName: string;

  constructor(
    private _matDialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private _dialogData: any) {
  }

  ngOnInit() {
    const category = this._dialogData.category;
    this.categoryName = category.nameRu || category.nameEn || category.nameCn;
  }

  onCloseClick(value: boolean): void {
    this._matDialogRef.close(value);
  }

}
