import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'b2b-delete-role-dialog',
  templateUrl: './delete-role-dialog.component.html',
  styleUrls: ['./delete-role-dialog.component.scss']
})
export class DeleteRoleDialogComponent implements OnInit {
  roles: any;
  selectedRole: number;

  constructor(
    private _matDialogRef: MatDialogRef<DeleteRoleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private _dialogData: any) {
  }

  ngOnInit() {
    this.roles = this._dialogData.roles;
  }

  onCloseClick(destroy: boolean): void {
    this._matDialogRef.close(destroy ? this.selectedRole : null);
  }

}
