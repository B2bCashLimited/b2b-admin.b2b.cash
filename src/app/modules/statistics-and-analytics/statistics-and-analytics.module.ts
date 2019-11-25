import { NgModule } from '@angular/core';
import { StatisticsAndAnalyticsRouting } from './statistics-and-analytics-routing';
import { StatisticsAndAnalyticsComponent } from './statistics-and-analytics.component';
import { SharedModule } from '@b2b/shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    StatisticsAndAnalyticsRouting
  ],
  declarations: [StatisticsAndAnalyticsComponent]
})
export class StatisticsAndAnalyticsModule {
}
