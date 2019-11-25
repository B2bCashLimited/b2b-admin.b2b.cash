import {NgModule} from '@angular/core';
import {ACTIVITY_DETAILS_ROUTING} from './activity-details-routing';
import {ActivityDetailsComponent} from './activity-details.component';
import {SharedModule} from '@b2b/shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    ACTIVITY_DETAILS_ROUTING
  ],
  declarations: [ActivityDetailsComponent]
})
export class ActivityDetailsModule {
}
