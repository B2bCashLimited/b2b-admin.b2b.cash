import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'b2b-delete-template-dialog',
  templateUrl: './delete-template-dialog.component.html',
  styleUrls: ['./delete-template-dialog.component.scss']
})
export class DeleteTemplateDialogComponent implements OnInit {

  constructor(private _matDialogRef: MatDialogRef<DeleteTemplateDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private _dialogData: any) {
  }

  ngOnInit() {
  }

  onCloseClick(destroy: boolean) {
    this._matDialogRef.close(destroy);
  }

}
