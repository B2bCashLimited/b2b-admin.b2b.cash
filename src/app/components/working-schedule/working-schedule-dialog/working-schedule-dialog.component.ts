import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatCheckboxChange,
  MatDialog,
  MatDialogRef
} from '@angular/material';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import * as moment from 'moment';
import {
  WorkingScheduleFormValidationModalComponent,
  WorkingScheduleFormValidationModalMatDialogData
} from '../../working-schedule-form-validation-modal/working-schedule-form-validation-modal.component';
import {CtmCalendarComponent} from '@b2b/components/ctm-calendar/ctm-calendar.component';
import {
  WorkingScheduleDeleteDialogComponent
} from '@b2b/components/working-schedule/working-schedule-delete-dialog/working-schedule-delete-dialog.component';
import {
  ModifiedCreatedWorkingScheduleSummary,
  TimeZone, WorkingDay,
  WorkingScheduleSummary
} from '@b2b/components/working-schedule/working-schedule-summary';
import {WorkingScheduleService} from '@b2b/services/working-schedule.service';
import {convertTimeZeroToDoubleZero, removeEmptyProperties} from '@b2b/utils';

@Component({
  selector: 'b2b-working-schedule-dialog',
  templateUrl: './working-schedule-dialog.component.html',
  styleUrls: ['./working-schedule-dialog.component.scss']
})
export class WorkingScheduleDialogComponent implements OnInit, OnDestroy {
  // calendar
  minDate: Date = new Date(new Date().getFullYear() - 2, new Date().getMonth(), new Date().getDate());
  maxDate: Date = new Date(new Date().getFullYear() + 2, new Date().getMonth(), new Date().getDate());
  // end calendar
  timeZoneList: TimeZone[];
  weekList = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  workingScheduleForm: FormGroup;
  workingSchedule: WorkingScheduleSummary | ModifiedCreatedWorkingScheduleSummary;
  isWorkingScheduleExists = false;
  isPending = false;
  successPopupToggle = false;
  selectedDays: any[] = [];
  selectedDay: any = {startHour: '', startMinute: '', endHour: '', endMinute: ''};
  selectedDayLabel: string;
  stretchDateError: string;
  selectableCalendar = true;
  actionButtons = false;
  isStretchPeriod = false;
  saveAfterStretch = false;
  dateForShow: string;
  timeForShow: string;
  createdWorkingSchedule: any;
  validationErrors: string[] = [];
  isSelectedDayHoliday = false;

  private _unsubscribe: Subject<void> = new Subject<void>();

  @ViewChild(CtmCalendarComponent) calendarComponent;

  /**
   * @Constructor
   */
  constructor(public dialogRef: MatDialogRef<WorkingScheduleDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private dialog: MatDialog,
              private _formBuilder: FormBuilder,
              private _workingScheduleService: WorkingScheduleService) {
    this.dialogRef.disableClose = true;
  }

  /**
   * OnInit lifecycle hook implementation
   */
  ngOnInit() {
    this.initFormGroup();
    this.initDifferentTimesFormArray();
    this.getTimeZoneList();
    this.setWorkingSchedule();
    this.onWorkingScheduleHoursChange();
  }

  /**
   * OnDestroy lifecycle hook implementation
   */
  ngOnDestroy() {
    this._unsubscribe.next();
    this._unsubscribe.complete();
  }

  /**
   * On closing working schedule dialog
   */
  onNoClick(): void {
    if (!!this.createdWorkingSchedule && Object.keys(this.createdWorkingSchedule).length > 0) {
      this.dialogRef.close(this.createdWorkingSchedule);
    } else if (!!this.data.scheduleData && Object.keys(this.data.scheduleData).length > 0 && this.isWorkingScheduleExists) {
      this.dialogRef.close({...this.data.scheduleData});
    } else {
      this.dialogRef.close();
    }
  }

  /**
   * Opens Delete working schedule dialog
   */
  openDeleteDialog(): void {
    const dialogRef = this.dialog.open(WorkingScheduleDeleteDialogComponent, {
      minWidth: '250px'
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this._unsubscribe))
      .subscribe(bool => {
        if (bool) {
          this.deleteWorkingSchedule();
        }
      });
  }

  /**
   * Opens form validation dialog to show validation errors
   */
  openFormValidationDialog(errors: string[]): void {
    const dialogRef = this.dialog.open(WorkingScheduleFormValidationModalComponent, {
      data: <WorkingScheduleFormValidationModalMatDialogData>{
        errors: errors,
      },
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this._unsubscribe))
      .subscribe(() => this.validationErrors = []);
  }

  /**
   * Calls {@link addWorkingDay} or {@link removeWorkingDay} function on changing working day checkboxes if working
   * schedule view is standard
   */
  onChangeSelectedDay(index: number, evt: MatCheckboxChange): void {
    if (evt.checked) {
      this.addWorkingDay(index);
    } else {
      this.removeWorkingDay(index);
    }
  }

  /**
   * On submitting form
   */
  onFormSubmit(): void {
    if (!this.isPending && !this.isWorkingScheduleExists) {
      if (this.workingScheduleForm.invalid || !this.checkForValidationErrors()) {
        this.setValidationErrors();
      } else {
        const isStandard = !!this.workingScheduleForm.get('isStandard').value;

        if (!isStandard) {
          this.fillWorkingDaysArrayForStandardScheduleView();
        } else {
          this.fillWorkingDaysArrayForFlexibleScheduleView();
        }

        this.prepareDataForCreate();
      }
    } else {
      this.openDeleteDialog();
    }
  }

  /**
   * Checks one time for all days `days checkboxes`
   */
  isCheckedOneTimeForAllDays(index: number): boolean {
    const oneTimeForAllDays: any[] = this.workingScheduleForm.get('oneTimeForAllDays').value;
    return oneTimeForAllDays.findIndex(item => item.dayOfWeek === index + 1) > -1;
  }

  /**
   * Checks different times `days of week` checkboxes
   */
  isCheckedDifferentTimes(item: FormGroup): boolean {
    return item.get('dayOfWeek').value !== '';
  }

  /**
   * Catches selected days array from calendar
   */
  onSelectedDaysArrayChange(selectedDays: any[]): void {
    this.selectedDays = selectedDays;
  }

  /**
   * Shows selected day date and time when working schedule already exists or before saving if working schedule flexible
   * view selected
   */
  onSelectedDayObjectChange(selectedDay: any): void {
    if (this.isWorkingScheduleExists || this.saveAfterStretch) {
      const selectedDayForShow = this.selectedDays.find(value => moment(value.date).isSame(selectedDay.date, 'days'));

      if (!!selectedDayForShow && Object.keys(selectedDayForShow).length > 0) {
        this.dateForShow = `${this.weekList[selectedDayForShow.dayOfWeek - 1]} ${moment(selectedDayForShow.date).locale('ru')
          .format('D MMMM')}`;
        this.timeForShow = !selectedDayForShow.isHoliday && convertTimeZeroToDoubleZero(selectedDayForShow);
      } else {
        this.dateForShow = null;
        this.timeForShow = null;
      }
    } else {
      this.selectedDay = selectedDay;
      this.selectedDayLabel = `${this.weekList[selectedDay.dayOfWeek - 1]} ${moment(selectedDay.date).locale('ru').format('D MMMM')}`;
    }
  }

  /**
   * Checks if day is selected in calendar
   */
  isDaySelected(): boolean {
    return !!this.selectedDay.dayOfWeek && !!this.selectedDay.date;
  }

  /**
   * Checks if selected day working times set
   */
  isWorkingTimeSet(): boolean {
    return (!this.isWorkingScheduleExists && this.selectedDay.startHour !== '' && this.selectedDay.startMinute !== '' &&
      this.selectedDay.endHour !== '' && this.selectedDay.endMinute !== '') || this.isSelectedDayHoliday;
  }

  /**
   * Adds days as holiday or working
   */
  setDayAsHoliday(): void {
    this.isSelectedDayHoliday = !this.isSelectedDayHoliday;

    const lastSelectedDate = moment(this.selectedDays[this.selectedDays.length - 1].date).format('YYYY-MM-DD'),
      newDate = moment(lastSelectedDate).add(1, 'days'),
      data = {
        dayOfWeek: newDate.isoWeekday(),
        startHour: '',
        startMinute: '',
        endHour: '',
        endMinute: '',
        date: newDate.toDate(),
        isHoliday: this.isSelectedDayHoliday
      };

    this.selectedDays.push(data);
    this.selectedDay = data;
    this.calendarComponent.refreshView();
  }

  /**
   * Finishes selecting days and opens action buttons
   */
  finishSchedule(): void {
    this.selectedDay = {
      startHour: '',
      startMinute: '',
      endHour: '',
      endMinute: ''
    };
    this.isSelectedDayHoliday = false;
    this.selectableCalendar = false;
    this.actionButtons = true;
  }

  /**
   * Opens input for stretching period
   */
  showStretchPeriod(): void {
    this.actionButtons = false;
    this.isStretchPeriod = true;
  }

  /**
   * Stretches period
   */
  stretchPeriod(): void {
    const stretchPeriodDate: string = moment(this.workingScheduleForm.get('stretchPeriod').value, 'DD.MM.YYYY').format('YYYY-MM-DD'),
      lastSelectedDate = moment(this.selectedDays[this.selectedDays.length - 1].date).format('YYYY-MM-DD');

    if (moment(stretchPeriodDate).isAfter(lastSelectedDate)) {
      const dateDifference = moment(stretchPeriodDate).diff(lastSelectedDate, 'days');
      let index = 0;
      this.stretchDateError = null;

      for (let i = 0; i < dateDifference; i++) {
        const date = moment(lastSelectedDate).add(i + 1, 'days'),
          dayOfWeek = date.isoWeekday();

        if (index > this.selectedDays.length - 1) {
          index = 0;
        }

        this.selectedDays.push({
          dayOfWeek: dayOfWeek,
          startHour: this.selectedDays[index].startHour,
          startMinute: this.selectedDays[index].startMinute,
          endHour: this.selectedDays[index].endHour,
          endMinute: this.selectedDays[index].endMinute,
          date: date.toDate(),
          isHoliday: this.selectedDays[index].isHoliday
        });
        index++;
      }
      this.calendarComponent.refreshView();
      this.isStretchPeriod = false;
      this.saveAfterStretch = true;
    } else {
      this.stretchDateError = `Введенная дата должна быть после ${moment(lastSelectedDate).format('DD.MM.YYYY')}`;
    }
  }

  /**
   * FormGroup initialization
   */
  private initFormGroup(): void {
    this.workingScheduleForm = this._formBuilder.group({
      isStandard: 0,
      isRegular: 0,
      timeZone: ['', Validators.required],
      adminPosition: this.data.adminPositionId,
      workingDays: this._formBuilder.array([]),
      oneTimeForAllDays: this._formBuilder.array([]),
      differentTimes: this._formBuilder.array([]),
      workingTime: this._formBuilder.group({
        startHour: ['', Validators.maxLength(2)],
        startMinute: ['', Validators.maxLength(2)],
        endHour: ['', Validators.maxLength(2)],
        endMinute: ['', Validators.maxLength(2)]
      }),
      stretchPeriod: ['', Validators.pattern(/^\s*(3[01]|[12][0-9]|0?[1-9])\.(1[012]|0?[1-9])\.((?:20)\d{2})\s*$/g)]
    });
  }

  /**
   * `differentTimes` FormArray initialization
   */
  private initDifferentTimesFormArray() {
    const differentTimes = this.workingScheduleForm.get('differentTimes') as FormArray;

    for (let i = 0; i < this.weekList.length; i++) {
      differentTimes.push(this._formBuilder.group({
        dayOfWeek: '',
        startHour: ['', Validators.maxLength(2)],
        startMinute: ['', Validators.maxLength(2)],
        endHour: ['', Validators.maxLength(2)],
        endMinute: ['', Validators.maxLength(2)],
        date: null,
        isHoliday: false
      }));
    }
  }

  /**
   * Gets time zones list
   */
  private getTimeZoneList(): void {
    this._workingScheduleService.getTimeZoneList()
      .pipe(takeUntil(this._unsubscribe))
      .subscribe(res => this.timeZoneList = res);
  }

  /**
   * Sets working schedule if exists and calls {@link patchValuesToForm} function to patch working
   * schedule values to Form
   */
  private setWorkingSchedule(): void {
    if (!!this.data.scheduleData && Object.keys(this.data.scheduleData).length > 0) {
      this.isWorkingScheduleExists = !!this.data.scheduleData && Object.keys(this.data.scheduleData).length > 0;

      if (this.isWorkingScheduleExists) {
        this.workingSchedule = this.data.scheduleData;
        this.selectableCalendar = false;
        this.workingScheduleForm.get('workingTime').disable();
        this.workingScheduleForm.get('differentTimes').disable();
        this.patchValuesToForm(this.workingSchedule);
      }
    }
  }

  /**
   * Patches values to Form on opening `Working schedule` popup if working schedule already exists
   */
  private patchValuesToForm(workingSchedule: any): void {
    const data: any = {
      isStandard: +workingSchedule.isStandard,
      isRegular: +workingSchedule.isRegular,
      timeZone: workingSchedule._embedded ? workingSchedule._embedded.timeZone.id : workingSchedule.timeZone.id
    };
    this.workingScheduleForm.patchValue(data);

    // Если стандартный вид графика
    if (!workingSchedule.isStandard) {
      // Если одно время на все дни
      if (!workingSchedule.isRegular) {
        this.patchOneTimeForAllDaysArray(workingSchedule);
        // Если разное время
      } else {
        this.patchDifferentTimesArray(workingSchedule);
      }
      // Если гибкий вид графика
    } else {
      this.patchFlexDays(workingSchedule);
    }
  }

  /**
   * Patches value to `oneTimeForAllDays` FormArray and `workingTime` FormGroup if schedule working time is one for all
   * days
   */
  private patchOneTimeForAllDaysArray(workingSchedule: any): void {
    const oneTimeForAllDays = this.workingScheduleForm.get('oneTimeForAllDays') as FormArray,
      workingTime = this.workingScheduleForm.get('workingTime') as FormArray,
      workingDays: any[] = workingSchedule.timeZone.workingDays;

    workingDays.forEach((value: any) => {
      oneTimeForAllDays.push(this._formBuilder.group({
        dayOfWeek: value.dayOfWeek,
        startHour: '',
        startMinute: '',
        endHour: '',
        endMinute: '',
        date: null,
        isHoliday: false
      }));
    });
    workingTime.patchValue(workingDays[0]);
  }

  /**
   * Patches value to `differentTimes` FormArray if schedule working time is different
   */
  private patchDifferentTimesArray(workingSchedule: any): void {
    const differentTimes = this.workingScheduleForm.get('differentTimes') as FormArray,
      workingDays: any[] = workingSchedule._embedded ? workingSchedule._embedded.workingDays : workingSchedule.timeZone.workingDays;

    workingDays.forEach((value: any) => {
      const index = value.dayOfWeek - 1;
      differentTimes.at(index).patchValue(value);
    });
  }

  /**
   * Patches value to form if working schedule view is flexible
   */
  private patchFlexDays(workingSchedule: any): void {
    const workingDays = workingSchedule._embedded ? workingSchedule._embedded.workingDays : workingSchedule.timeZone.workingDays;

    workingDays.forEach(workingDay => {
      const data = {
        dayOfWeek: workingDay.dayOfWeek,
        date: workingDay.date.date ? workingDay.date.date : workingDay.date,
        startHour: workingDay.startHour,
        startMinute: workingDay.startMinute,
        endHour: workingDay.endHour,
        endMinute: workingDay.endMinute,
        isHoliday: workingDay.isHoliday
      };
      this.selectedDays.push(data);
    });
  }

  /**
   * Fires on working hours changes (if standard schedule view, in one time for all days) and changes
   * working hours in `oneTimeForAllDays` array
   */
  private onWorkingScheduleHoursChange(): void {
    const oneTimeForAllDays = this.workingScheduleForm.get('oneTimeForAllDays') as FormArray,
      workingDays: WorkingDay[] = oneTimeForAllDays.value;

    this.workingScheduleForm.get('workingTime').valueChanges
      .pipe(takeUntil(this._unsubscribe))
      .subscribe(res => {
        for (const prop in res) {
          if (prop && res.hasOwnProperty(prop)) {
            res[prop] = +res[prop];
          }
        }

        workingDays.forEach((value, index) => {
          if (!!oneTimeForAllDays.at(index)) {
            oneTimeForAllDays.at(index).patchValue(res);
          }
        });
      });
  }

  /**
   * Adds selected working day to `oneTimeForAllDays` array or `differentTimes` array depending on working schedule view
   */
  private addWorkingDay(index: number): void {
    const isRegular = !!this.workingScheduleForm.get('isRegular').value,
      oneTimeForAllDays = this.workingScheduleForm.get('oneTimeForAllDays') as FormArray,
      differentTimes = this.workingScheduleForm.get('differentTimes') as FormArray;

    // Если одно время на все дни
    if (!isRegular) {
      const workingTime = this.workingScheduleForm.get('workingTime').value;

      oneTimeForAllDays.push(this._formBuilder.group({
          dayOfWeek: index + 1,
          startHour: +workingTime.startHour || 0,
          startMinute: +workingTime.startMinute || 0,
          endHour: +workingTime.endHour || 0,
          endMinute: +workingTime.endMinute || 0,
          date: null,
          isHoliday: false
        })
      );
      // Если разное время
    } else {
      differentTimes.at(index).patchValue({dayOfWeek: index + 1});
    }
  }

  /**
   * Removes unselected day from `oneTimeForAllDays` array
   */
  private removeWorkingDay(index: number): void {
    const isRegular = !!this.workingScheduleForm.get('isRegular').value,
      oneTimeForAllDays = this.workingScheduleForm.get('oneTimeForAllDays') as FormArray,
      differentTimes = this.workingScheduleForm.get('differentTimes') as FormArray;

    // Если одно время на все дни
    if (!isRegular) {
      const deletingWorkingDay = (<any[]>oneTimeForAllDays.value).find((item: any) => item.dayOfWeek === index + 1),
        deletingWorkingDayIndex = (<any[]>oneTimeForAllDays.value).indexOf(deletingWorkingDay);

      oneTimeForAllDays.removeAt(deletingWorkingDayIndex);
      // Если разное время
    } else {
      differentTimes.at(index).patchValue({dayOfWeek: '0'});
    }
  }

  /**
   * Fills `workingDays` array of form for sending data if standard schedule view selected
   */
  private fillWorkingDaysArrayForStandardScheduleView(): void {
    const isRegular = !!this.workingScheduleForm.get('isRegular').value,
      workingDays = this.workingScheduleForm.get('workingDays') as FormArray,
      oneTimeForAllDays = this.workingScheduleForm.get('oneTimeForAllDays'),
      differentTimes = this.workingScheduleForm.get('differentTimes'),
      workingTime = this.workingScheduleForm.get('workingTime').value;

    // Если одно время на все дни
    if (!isRegular) {
      oneTimeForAllDays['controls'].forEach((value: FormGroup) => {
        value.patchValue({
          startHour: workingTime.startHour || 0,
          startMinute: workingTime.startMinute || 0,
          endHour: workingTime.endHour || 0,
          endMinute: workingTime.endMinute || 0,
        });

        workingDays.push(value);
      });
      // Если разное время
    } else {
      const selectedDays = differentTimes['controls'].filter((value: any) => value.value.dayOfWeek > 0);

      selectedDays.forEach((value: any) => {
        workingDays.push(this._formBuilder.group({
          dayOfWeek: value.value.dayOfWeek,
          startHour: +value.value.startHour,
          startMinute: +value.value.startMinute,
          endHour: +value.value.endHour,
          endMinute: +value.value.endMinute,
          date: null,
          isHoliday: false
        }));
      });
    }
  }

  /**
   * Fills `workingDays` array of form for sending data if flexible schedule view selected
   */
  private fillWorkingDaysArrayForFlexibleScheduleView(): void {
    const workingDays = this.workingScheduleForm.get('workingDays') as FormArray;

    this.selectedDays.forEach((selectedDay: any) => {
      workingDays.push(this._formBuilder.group({
        dayOfWeek: selectedDay.dayOfWeek,
        startHour: +selectedDay.startHour,
        startMinute: +selectedDay.startMinute,
        endHour: +selectedDay.endHour,
        endMinute: +selectedDay.endMinute,
        date: moment(selectedDay.date).format('YYYY-MM-DD HH:mm:ss'),
        isHoliday: selectedDay.isHoliday
      }));
    });
  }

  /**
   * Prepares data for sending to server to create working schedule
   */
  private prepareDataForCreate(): void {
    let formValue: any = this.workingScheduleForm.value;

    formValue.workingTime = null;
    formValue.differentTimes = null;
    formValue.oneTimeForAllDays = null;
    formValue.stretchPeriod = null;
    formValue = removeEmptyProperties(formValue);
    this.isPending = true;

    if (!!this.data.adminPositionId) {
      this.createWorkingSchedule(formValue);
    } else {
      const data: any = {...formValue};

      data.timeZone = this.timeZoneList.find(item => item.id === data.timeZone);
      data.timeZone.workingDays = data.workingDays;
      this.isPending = false;
      this.successPopupToggle = true;
      this.createdWorkingSchedule = data;
    }
  }

  /**
   * Creates working schedule
   */
  private createWorkingSchedule(data: WorkingScheduleSummary): void {
    this._workingScheduleService.createWorkingSchedule(data)
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: ModifiedCreatedWorkingScheduleSummary) => {
        this.isPending = false;
        this.successPopupToggle = true;
        this.createdWorkingSchedule = res;
      }, () => {
        this.isPending = false;
        this.resetFormControls();
      });
  }

  /**
   * Deletes current activity working schedule
   */
  private deleteWorkingSchedule(): void {
    this.isPending = true;

    if (!!this.workingSchedule && this.workingSchedule.id) {
      this._workingScheduleService.deleteWorkingSchedule(this.workingSchedule.id)
        .pipe(takeUntil(this._unsubscribe))
        .subscribe(() => {
          this.resetVariablesAfterDelete();
        }, () => {
          this.isPending = false;
        });
    } else {
      this.resetVariablesAfterDelete();
    }
  }

  /**
   * Resets some variables after deleting working schedule
   */
  private resetVariablesAfterDelete(): void {
    this.isWorkingScheduleExists = false;
    this.isPending = false;
    this.selectableCalendar = true;
    this.workingSchedule = null;
    this.selectedDays = null;
    this.createdWorkingSchedule = null;
    this.resetFormControls();
  }

  /**
   * Resets Form controls after deleting working schedule
   */
  private resetFormControls(): void {
    const oneTimeForAllDays = this.workingScheduleForm.get('oneTimeForAllDays') as FormArray;
    oneTimeForAllDays.controls.splice(0);
    oneTimeForAllDays.value.splice(0);
    this.workingScheduleForm.get('isStandard').reset(0);
    this.workingScheduleForm.get('isRegular').reset(0);
    this.workingScheduleForm.get('workingTime').reset();
    this.workingScheduleForm.get('workingTime').enable();
    this.workingScheduleForm.get('timeZone').reset('');
    this.workingScheduleForm.get('differentTimes').enable();
    this.workingScheduleForm.get('differentTimes')['controls'].forEach((value: FormGroup) => {
      value.setValue({
        dayOfWeek: '',
        startHour: '',
        startMinute: '',
        endHour: '',
        endMinute: '',
        date: null,
        isHoliday: false
      });
    });
  }

  /**
   * Checks for form validation errors
   */
  private checkForValidationErrors(): boolean {
    const isStandard = !!this.workingScheduleForm.get('isStandard').value,
      isRegular = !!this.workingScheduleForm.get('isRegular').value;

    if (!isStandard) {
      if (!isRegular) {
        if (this.workingScheduleForm.get('oneTimeForAllDays').value.length === 0) {
          return false;
        }
      } else {
        const differentTimesValue: any[] = this.workingScheduleForm.get('differentTimes').value,
          index = differentTimesValue.findIndex((value: any) => value.dayOfWeek > 0);

        if (index === -1) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Sets validation errors and opens dialog
   */
  private setValidationErrors(): void {
    const isStandard = !!this.workingScheduleForm.get('isStandard').value,
      isRegular = !!this.workingScheduleForm.get('isRegular').value;

    if (this.workingScheduleForm.invalid) {
      this.validationErrors.push('workingSchedule.validation.chooseTimeZone');
    }

    if (!isStandard) {
      if (!isRegular) {
        const oneTimeForAllDaysValue: any[] = this.workingScheduleForm.get('oneTimeForAllDays').value;

        if (oneTimeForAllDaysValue.length === 0) {
          this.validationErrors.push('workingSchedule.validation.chooseDaysOfWeek');
        }
      } else {
        const differentTimesValue: any[] = this.workingScheduleForm.get('differentTimes').value,
          index = differentTimesValue.findIndex((value: any) => value.dayOfWeek > 0);

        if (index === -1) {
          this.validationErrors.push('workingSchedule.validation.chooseDaysOfWeek');
        }
      }
    }

    this.openFormValidationDialog(this.validationErrors);
  }

}
