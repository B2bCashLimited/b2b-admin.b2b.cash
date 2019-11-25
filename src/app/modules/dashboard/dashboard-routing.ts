import {Routes, RouterModule} from '@angular/router';
import {DashboardComponent} from './dashboard.component';

const routes: Routes = [
  {path: '', component: DashboardComponent}
];

export const DASHBOARD_ROUTING = RouterModule.forChild(routes);
