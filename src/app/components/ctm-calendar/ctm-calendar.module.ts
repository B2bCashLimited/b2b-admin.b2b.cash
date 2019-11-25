import { NgModule } from '@angular/core';
import {
  CommonModule,
  registerLocaleData
} from '@angular/common';
import {
  CalendarDateFormatter,
  CalendarModule, DateAdapter
} from 'angular-calendar';
import localeRu from '@angular/common/locales/ru';
import localeCn from '@angular/common/locales/zh';
import {CtmCalendarComponent} from '@b2b/components/ctm-calendar/ctm-calendar.component';
import {CustomDateFormatter} from '@b2b/components/ctm-calendar/custom-date-formatter.provider';
import {adapterFactory} from 'angular-calendar/date-adapters/date-fns';

registerLocaleData(localeRu);
registerLocaleData(localeCn);

@NgModule({
  imports: [
    CommonModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    })
  ],
  declarations: [CtmCalendarComponent],
  exports: [CtmCalendarComponent],
  providers: [
    {
      provide: CalendarDateFormatter,
      useClass: CustomDateFormatter
    }
  ]

})
export class CtmCalendarModule {
}
