import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'b2b-date-range',
  templateUrl: './date-range-popup.component.html',
  styleUrls: ['./date-range-popup.component.scss']
})
export class DateRangeComponent implements OnInit {
  minDate: Date = new Date(new Date().getFullYear() - 2, new Date().getMonth(), new Date().getDate());
  maxDate: Date = new Date(new Date().getFullYear() + 2, new Date().getMonth(), new Date().getDate());
  status = '';
  selectedPeriods = [{
    type: 'schedule',
    dates: []
  }];
  resetCalendar = false;
  
  constructor(public dialogRef: MatDialogRef<DateRangeComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }
  
  ngOnInit() {
    this.selectedPeriods[0].dates[0] = this.data.startDate;
    this.selectedPeriods[0].dates[1] = this.data.finishDate;

    if (this.data.minDate) {
      this.minDate = this.data.minDate;
    }

    if (this.data.maxDate) {
      this.maxDate = this.data.maxDate;
    }
  }
  
  setMinDate(date) {
    this.minDate = date;
    this.data.status = true;
  }
  
  setStatus(status) {
    this.status = status;
  }
  
  clearCalendar() {
    this.resetCalendar = !this.resetCalendar;
    this.selectedPeriods = [{
      type: 'schedule',
      dates: []
    }];
  }
  
  confirm(bool = false) {
    if (bool) {
      this.dialogRef.close(this.selectedPeriods[0].dates);
    } else {
      this.dialogRef.close([]);
    }
  }
}
