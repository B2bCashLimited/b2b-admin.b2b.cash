import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'b2b-confirm-delete-template',
  templateUrl: './confirm-delete-template.component.html',
  styleUrls: ['./confirm-delete-template.component.scss']
})
export class ConfirmDeleteTemplateComponent implements OnInit {

  constructor(private _matDialogRef: MatDialogRef<ConfirmDeleteTemplateComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
  }

  onCloseClick(value: boolean): void {
    this._matDialogRef.close(value);
  }

}
