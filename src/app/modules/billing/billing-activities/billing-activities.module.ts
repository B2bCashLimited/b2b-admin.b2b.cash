import {NgModule} from '@angular/core';
import {ACTIVITIES_ROUTING} from './billing-activities-routing';
import {BillingActivitiesComponent} from './billing-activities.component';
import {SharedModule} from '@b2b/shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    ACTIVITIES_ROUTING
  ],
  declarations: [BillingActivitiesComponent]
})
export class BillingActivitiesModule {
}
