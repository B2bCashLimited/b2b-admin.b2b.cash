import {
  Component,
  OnInit
} from '@angular/core';
import {
  MatDialog,
  MatDialogRef
} from '@angular/material';

@Component({
  selector: 'b2b-working-schedule-delete-dialog',
  templateUrl: './working-schedule-delete-dialog.component.html',
  styleUrls: ['./working-schedule-delete-dialog.component.scss']
})
export class WorkingScheduleDeleteDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<WorkingScheduleDeleteDialogComponent>,
              public dialog: MatDialog) {
  }

  ngOnInit() {
  }

  closePopup(bool: boolean): void {
    this.dialogRef.close(bool);
  }

}
