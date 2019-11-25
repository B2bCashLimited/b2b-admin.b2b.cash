import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  CalendarMonthViewDay,
  DAYS_OF_WEEK
} from 'angular-calendar';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import {ConfigService} from '@b2b/services/config.service';

export const oneDayMs = 86400000;
export function ObjectTemplate() {
  this.type = 'schedule';
  this.dates = [];
}

@Component({
  selector: 'b2b-ctm-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ctm-calendar.component.html'
})
export class CtmCalendarComponent implements OnInit {
  view = 'month';
  viewDate: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  activeDayIsOpen = true;
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;
  errorDates = '';

  selectedDays: any[] = [];
  selectedMonthViewDay: CalendarMonthViewDay;
  refresh: Subject<any> = new Subject<any>();
  body: CalendarMonthViewDay[];
  existedSelectedDaysArr: any[];

  @Input() calendarType: string; // schedule, interval, date
  @Input() periods: any[] = [];
  @Input() status: string;
  @Input() minInterval;
  @Input() minDate: Date;
  @Input() maxDate: Date;
  @Input() selectablePeriod = false;
  @Input() selectableCalendar = true;
  @Input() isHoliday = false;
  @Input() set existedSelectedDays(value: any[]) {
    this.existedSelectedDaysArr = value;

    if (!this.selectablePeriod && this.existedSelectedDaysArr && this.body) {
      this.body.forEach(day => {
        const formattedDate = moment(day.date).format('YYYY-MM-DD HH:mm:ss');

        if (this.existedSelectedDaysArr.some((selectedDay: any) => {
          return moment(selectedDay.date).isSame(formattedDate, 'days');
        })) {
          day.cssClass = 'schedule period-single';
        }
      });
    }
  }
  @Input('clearResult')
  set clearResult(value: boolean) {
    this.clear(value);
  }
  
  @Output() iterateStep = new EventEmitter<any>();
  @Output() setStatus = new EventEmitter<any>();
  @Output() setMinDate = new EventEmitter<any>();
  @Output() addObject = new EventEmitter<any>();
  @Output() periodsChange = new EventEmitter<any[]>();
  @Output() selectedDaysArray = new EventEmitter<any>();
  @Output() selectedDayObject = new EventEmitter<any>();

  constructor(public config: ConfigService) {
  }

  ngOnInit() {
    if (this.periods.length === 0) {
      const obj = new ObjectTemplate();
      this.addObject.next(obj);
    }
  }

  /**
   * Refreshes the calendar
   */
  refreshView(): void {
    this.refresh.next();
  }
  
  clear(value: boolean) {
    const obj = new ObjectTemplate();
    this.addObject.next(obj);
  }
  
  callParentStepIteration() {
    this.iterateStep.next();
  }

  dayClicked(day: CalendarMonthViewDay): void {
    if (this.selectableCalendar) {
      if (this.selectablePeriod) {
        const selectedDateTime = day.date.getTime(),
          dateIndex = this.selectedDays.findIndex(selectedDay => selectedDay.date.getTime() === selectedDateTime),
          dayOfWeek = moment(day.date).isoWeekday();

        if (dateIndex > -1) {
          day.cssClass = '';
          this.selectedDays.splice(dateIndex, 1);
          this.selectedDayObject.emit({startHour: '', startMinute: '', endHour: '', endMinute: ''});
        } else {
          const obj: any = {
            dayOfWeek: dayOfWeek,
            date: day.date,
            startHour: '',
            startMinute: '',
            endHour: '',
            endMinute: '',
            isHoliday: this.isHoliday
          };

          if (this.selectedDays.length > 0 && moment(day.date).diff(this.selectedDays[this.selectedDays.length - 1].date, 'days') === 1) {
            day.cssClass = this.isHoliday ? 'noschedule period-single' : 'schedule period-single';
            this.selectedDays.push(obj);
            this.selectedDayObject.emit(obj);
            this.selectedMonthViewDay = day;
          } else if (this.selectedDays.length === 0) {
            day.cssClass = 'schedule period-single';
            this.selectedDays.push(obj);
            this.selectedDayObject.emit(obj);
            this.selectedMonthViewDay = day;
          }
        }
        this.selectedDaysArray.emit(this.selectedDays);
      } else {
        const isCorrectDate = !!(day.date.getTime() <= this.maxDate.getTime());

        if (this.status !== 'showCompletedSchedule' && this.status !== 'scheduleIsSet' && isCorrectDate) {
          const minDate = this.minDate.getTime();
          const clickedDate = new Date(day.date).getTime();
    
          if (minDate <= clickedDate) {
            const n = this.periods.length - 1;
            const dates = this.periods[n]['dates'];
      
            const _date_0 = new Date(day.date), date_0 = _date_0.getTime();
      
            const _date_1 = new Date(dates[0]), date_1 = _date_1.getTime();
            const _date_2 = new Date(dates[0]), date_2 = _date_2.getTime();
      
            if (this.calendarType !== 'date') {
              if (dates.length === 2) {
                dates.pop();
              }
        
              if (dates.length === 1 && date_1 === date_0) {
                dates.pop();
              }
            } else {
              dates.length = 0;
            }
      
            const date0 = moment(date_0);
            const date1 = moment(date_1);
            const date2 = moment(date_2);
      
            if (date_0 && date_1 &&
              this.periods[this.periods.length - 1]['type'] === 'schedule' &&
              this.calendarType === 'schedule' &&
              (
                date_0 > date_1 &&
                date0.diff(date1, 'days') !== this.minInterval ||
                date_1 >= date_0 &&
                date1.diff(date0, 'days') !== this.minInterval
              )
            ) {
              this.errorDates = `В соответствии с вашим маршрутом, дата выгрузки должна быть
              ${date2.add(Math.abs(this.minInterval), 'days').locale(this.config.locale.toLocaleLowerCase()).format('D MMMM')}`;
            } else {
              this.errorDates = '';
              dates.push(day.date);
            }
          }
        }

        if (!this.selectablePeriod && this.existedSelectedDaysArr && this.existedSelectedDaysArr.length > 0) {
          this.body.forEach(bodyDay => {
            const formattedDate = moment(bodyDay.date).format('YYYY-MM-DD HH:mm:ss');

            if (this.existedSelectedDaysArr.some((selectedDay: any) => {
              return moment(selectedDay.date).isSame(formattedDate, 'days');
            })) {
              bodyDay.cssClass = '';
            }
          });
        }

        this.periodsChange.emit(this.periods[0]['dates']);
      }
    } else {
      this.selectedDayObject.emit(day);
    }
  }

  /**
   * Before month view render event
   */
  beforeMonthViewRender({body}: {body: CalendarMonthViewDay[]}): void {
    this.body = body;

    if (this.selectablePeriod && this.existedSelectedDaysArr) {
      body.forEach(day => {
        const formattedDate = moment(day.date).format('YYYY-MM-DD HH:mm:ss');

        if (this.existedSelectedDaysArr.some((selectedDay: any) => {
          return moment(selectedDay.date).isSame(formattedDate, 'days') && !selectedDay.isHoliday;
        })) {
          day.cssClass = 'schedule period-single';
        } else if (this.existedSelectedDaysArr.some((selectedDay: any) => {
          return moment(selectedDay.date).isSame(formattedDate, 'days') && selectedDay.isHoliday;
        })) {
          day.cssClass = 'noschedule period-single';
        }
      });
    }
  }
  
  setPeriod() {
    const periods = this.periods;
    let n = periods.length - 1;
    const lastPeriod = periods[n];
    
    const date_1 = lastPeriod['dates'].length > 1 ? lastPeriod['dates'][1] : null;
    
    if (this.minInterval > 1 && !date_1 && lastPeriod['type'] === 'schedule') {
      this.errorDates = `Период между точки загрузки и точки выгрузки не должен быть меньше,
        чем ${moment(periods[periods.length - 1]['dates'][0]).add(this.minInterval, 'days')
        .locale('ru').format('D MMMM')} в соответствии с вашим маршрутом`;
      return;
    }
    
    lastPeriod['dates'].sort((a, b) => {
      if (a > b) {
        return 1;
      }
      if (b < a) {
        return -1;
      }
      return 0;
    });
    
    const lastDate = lastPeriod['dates'].length === 2 ?
      new Date(lastPeriod['dates'][1]) :
      new Date(lastPeriod['dates'][0]);
    const nextDate = new Date(lastDate.getTime() + oneDayMs);
    
    this.callParentStepIteration();
    
    const obj = new ObjectTemplate();
    this.addObject.next(obj);
    
    n = periods.length - 1;
    periods[n]['type'] = (periods[n - 1]['type'] === 'schedule') ? 'noschedule' : 'schedule';
    periods[n]['dates'] = [nextDate];
    
    this.setStatus.next((periods[n - 1]['type'] === 'noschedule') ? 'scheduleAdd' : 'noscheduleAdd');
    
    this.setMinDate.next(nextDate);
  }
  
  checkDate(date) {
    let cellType;
    
    const _date_0 = new Date(date), date_0 = _date_0.getTime();
    
    this.periods.map(period => {
      const _date_1 = new Date(period['dates'][0]), date_1 = _date_1.getTime();
      const _date_2 = new Date(period['dates'][1]), date_2 = _date_2.getTime();
      
      if ((date_0 >= date_1 && date_0 <= date_2) ||
        (date_0 <= date_1 && date_0 >= date_2) ||
        (period['dates'].length === 1 && date_1 === date_0)) {
        cellType = period['type'];
        return;
      }
    });
    
    return cellType;
  }
  
  checkBorders(date) {
    const periods = this.periods;
    let borderType;
    const _date_0 = new Date(date), date_0 = _date_0.getTime();
    
    periods.map(period => {
      const borderDates = period['dates'];
      const _date_1 = new Date(borderDates[0]), date_1 = _date_1.getTime();
      const _date_2 = new Date(borderDates[1]), date_2 = _date_2.getTime();
      
      if ((date_1 < date_2 && date_0 === date_1) ||
        (date_1 > date_2 && date_0 === date_2)) {
        borderType = 'start';
        return;
      }
      
      if ((date_1 < date_2 && date_0 === date_2) ||
        (date_1 > date_2 && date_0 === date_1)) {
        borderType = 'end';
        return;
      }
      
      if (borderDates.length === 1 && date_0 === date_1) {
        borderType = 'single';
        return;
      }
    });
    
    return borderType;
  }
  
  showAddButton() {
    if (this.periods.length > 0) {
      const n = this.periods.length - 1;
      if (!!this.periods[n]['dates'].length) {
        return true;
      }
    }
    return false;
  }

}
