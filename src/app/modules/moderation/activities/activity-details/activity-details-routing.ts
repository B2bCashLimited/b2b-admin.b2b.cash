import {Routes, RouterModule} from '@angular/router';
import {ActivityDetailsComponent} from './activity-details.component';

const routes: Routes = [
  {path: '', component: ActivityDetailsComponent}
];

export const ACTIVITY_DETAILS_ROUTING = RouterModule.forChild(routes);
