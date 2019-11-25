import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { MatDialog } from '@angular/material';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {WorkingScheduleDialogComponent} from '@b2b/components/working-schedule/working-schedule-dialog/working-schedule-dialog.component';
import {setWorkingDaysForView, setWorkingTimesForView, sortSelectedDaysByDayOfWeek} from '@b2b/utils';

@Component({
  selector: 'b2b-working-schedule',
  templateUrl: './working-schedule.component.html',
  styleUrls: ['./working-schedule.component.scss']
})
export class WorkingScheduleComponent implements OnInit, OnDestroy, OnChanges {

  workingSchedule: any;
  workingScheduleExists = false;
  weekList = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  datesOfWeek: string;
  workingTimes: string;

  @Input() scheduleData: any;
  @Input() adminPositionId: string;

  @Output() createdWorkingSchedule = new EventEmitter();

  private _unsubscribe: Subject<void> = new Subject<void>();

  constructor(public dialog: MatDialog) {}

  openDialog(): void {
    const dialogRef = this.dialog.open(WorkingScheduleDialogComponent, {
      minWidth: '250px',
      data: {
        scheduleData: this.scheduleData,
        adminPositionId: this.adminPositionId
      }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this._unsubscribe))
      .subscribe(result => {
        this.createdWorkingSchedule.emit(result);
      });
  }

  ngOnInit() {
  }

  ngOnChanges() {
    this.getWorkingSchedule();
  }

  ngOnDestroy() {
    this._unsubscribe.next();
    this._unsubscribe.complete();
  }

  /**
   * Checks if employee has working schedule
   */
  private getWorkingSchedule(): void {
    this.workingSchedule = this.scheduleData;
    this.workingScheduleExists = !!this.workingSchedule && Object.keys(this.workingSchedule).length > 0;

    if (this.workingScheduleExists && !this.workingSchedule.isStandard) {
      const workingDaysArray: any[] = sortSelectedDaysByDayOfWeek(this.workingSchedule.timeZone.workingDays);

      workingDaysArray.forEach(() => {
        const minDayOfWeekIndex = workingDaysArray[0].dayOfWeek - 1,
          maxDayOfWeekIndex = workingDaysArray[workingDaysArray.length - 1].dayOfWeek - 1;

        this.workingTimes = setWorkingTimesForView(this.workingSchedule.isRegular, workingDaysArray[0]);
        this.datesOfWeek = setWorkingDaysForView(this.workingSchedule.isRegular, workingDaysArray, minDayOfWeekIndex,
          maxDayOfWeekIndex, this.weekList);
      });
    }
  }
}
