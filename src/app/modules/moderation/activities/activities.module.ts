import {NgModule} from '@angular/core';
import {ACTIVITIES_ROUTING} from './activities-routing';
import {ActivitiesComponent} from './activities.component';
import {SharedModule} from '@b2b/shared/shared.module';
import {ActivityService} from './activity.service';

@NgModule({
  imports: [
    SharedModule,
    ACTIVITIES_ROUTING
  ],
  declarations: [
    ActivitiesComponent
  ],
  providers:[
    ActivityService
  ]
})
export class ActivitiesModule {
}
