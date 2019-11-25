import {NgModule} from '@angular/core';
import {DASHBOARD_ROUTING} from './dashboard-routing';
import {DashboardComponent} from './dashboard.component';
import {SharedModule} from '@b2b/shared/shared.module';

@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    SharedModule,
    DASHBOARD_ROUTING
  ]
})
export class DashboardModule {
}
