import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'b2b-confirm-destroy-dialog',
  templateUrl: './confirm-destroy-dialog.component.html',
  styleUrls: ['./confirm-destroy-dialog.component.scss']
})
export class ConfirmDestroyDialogComponent implements OnInit {

  constructor(private _matDialogRef: MatDialogRef<ConfirmDestroyDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private _dialogData: any) {
  }

  ngOnInit() {
  }

  onCloseClick(destroy: boolean) {
    this._matDialogRef.close(destroy);
  }

}
