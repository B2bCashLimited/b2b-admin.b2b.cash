import {Component, OnDestroy, OnInit} from '@angular/core';
import {clearSubscription} from '@b2b/decorators';
import {catchError, switchMap} from 'rxjs/operators';
import * as moment from 'moment';
import {User} from '../../moderation/products/models/user.model';
import {interval, Subscription} from 'rxjs';
import {ActivityNameService} from '@b2b/services/activity-name.service';
import {UserService} from '@b2b/services/user.service';
import {ChatService} from '../chat.service';
import {Moment} from 'moment';
import {of} from 'rxjs/internal/observable/of';

@Component({
  selector: 'b2b-consultant',
  templateUrl: './consultant.component.html',
  styleUrls: ['./consultant.component.scss']
})
export class ConsultantComponent implements OnInit, OnDestroy {
  activities: any[];
  isInWork = false;
  limitTime = 8 * 60 * 60;   // seconds
  powerButtonDisabled = false;
  powerButtonPressed = false;
  startTime = 0;  // seconds
  worked: {
    pos: number,
    neg: number,
    total: number
  } = {
    pos: 0,
    neg: 0,
    total: 0
  };
  workingSchedule;
  user: User;
  userFIO: string;

  private _activitiesSub: Subscription;
  private _chatAutoclosedSub: Subscription;
  private _consIsInWorkSub: Subscription;
  private _consStatSub: Subscription;
  private _interval: Subscription;
  private _pauseConsSub: Subscription;
  private _startConsSub: Subscription;
  private _userSub: Subscription;

  constructor(private activityNameService: ActivityNameService,
              private userService: UserService,
              private chatService: ChatService) {
  }

  ngOnInit() {
    this.getActivityNames();
    this.getUser();
    this.chatService.componentDidLoad(this.user);
    this._consIsInWorkSub = this.chatService.consultantIsInWork.subscribe(value => {
      if (this.isInWork !== value) {
        this.isInWork = value;
      }
    });
    this._interval = interval(1000).subscribe(tick => {
      if (this.isInWork) {
        this.startTime++;
      }
    });
    this._consStatSub = this.chatService.getConsultantStat().subscribe(value => {
      this.startTime = value.workTime;
      this.worked.neg = value.negative;
      this.worked.pos = value.positive;
      this.worked.total = value.total;
    });
    this._chatAutoclosedSub = this.chatService.chatAutoclosed.subscribe(value => {
      this.closedChatsCounterUpdate();
    });
  }

  ngOnDestroy(): void {
    this.chatService.pauseConsultant().subscribe(value => {
      this.isInWork = false;
      this.chatService.consultantIsInWork.next(false);
    });
    this.chatService.disconnect();
  }

  getActivityNames() {
    this._activitiesSub = this.activityNameService.getActivityNames()
      .subscribe((activityNames: any[]) => {
        this.activities = activityNames;
      });
  }

  getUser() {
    const user = this.user = this.userService.currentUser;
    this.userFIO = `${user.lastName} ${user.firstName[0]}.${user.middleName ? (user.middleName[0] + '.') : ''}`;
    this.workingSchedule = user['_embedded']['adminPosition'] ? user['_embedded']['adminPosition']['workingSchedule'] : null;
  }

  workingScheduleForToday(ws = this.workingSchedule): { begin: Moment | string, end: Moment | string, isHoliday: boolean } {
    const holiday = {
      begin: '--:--',
      end: '--:--',
      isHoliday: true
    };
    if (ws) {
      const now = moment();
      const tz = ws.timeZone;   // utcOffset '-09:00'
      const day = tz.workingDays.find(value => {
        if (value.dayOfWeek === 7) {
          return now.day() === 0;
        }
        return value.dayOfWeek === now.day();
      });
      if (day) {
        const begin = moment(`${day.startHour}:${day.startMinute}`, 'HH:mm').utcOffset(tz.utcOffset).format('HH:mm');
        const end = moment(`${day.endHour}:${day.endMinute}`, 'HH:mm').utcOffset(tz.utcOffset).format('HH:mm');
        return {
          begin: begin,
          end: end,
          isHoliday: day.isHoliday
        };
      } else {
        return holiday;
      }
    }
    return holiday;
  }

  secondsToDateString(secs: number): string {
    return moment.unix(secs).utc().format('HH:mm:ss');
  }

  clickPowerButton() {
    if (!this.powerButtonDisabled) {
      this.powerButtonPressed = !this.powerButtonPressed;
      if (this.powerButtonPressed) {
        this.powerButtonDisabled = true;
        clearSubscription(this._startConsSub);
        this._startConsSub = this.chatService.startConsultant()
          .pipe(switchMap(value => {
            this.powerButtonDisabled = false;     // разблок в любом случае
            if (value.result === true) {          // вкл кнопку только если result: true
              this.isInWork = true;
              this.chatService.consultantIsInWork.next(true);
              return this.chatService.getConsultantStat();
            }
            return of(null);
          }), catchError((err, c) => {
            console.log('error0', err);
            return c;
          })).subscribe(value => {
            if (value) {
              this.startTime = value.workTime;
            }
          });
      } else {
        this.powerButtonDisabled = true;
        clearSubscription(this._pauseConsSub);
        this._pauseConsSub = this.chatService.pauseConsultant().subscribe(value => {
          this.powerButtonDisabled = false;   // разблок в любом случае
          if (value.result === true) {        // выкл кнопку только если result: true
            this.isInWork = false;
            this.chatService.consultantIsInWork.next(false);
          }
        }, error1 => {
          console.log('eror1', error1);
        });
      }
    }
  }

  timeOverLimit(time: number, limit: number): boolean {
    return (time - limit) > 0;
  }

  closedChatsCounterUpdate() {
    clearSubscription(this._consStatSub);
    this._consStatSub = this.chatService.getConsultantStat().subscribe(value => {
      this.worked.neg = value.negative;
      this.worked.pos = value.positive;
      this.worked.total = value.total;
    });
  }
}
