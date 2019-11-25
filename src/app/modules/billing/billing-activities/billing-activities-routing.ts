import {Routes, RouterModule} from '@angular/router';
import {BillingActivitiesComponent} from './billing-activities.component';

const routes: Routes = [
  {path: '', component: BillingActivitiesComponent}
];

export const ACTIVITIES_ROUTING = RouterModule.forChild(routes);
