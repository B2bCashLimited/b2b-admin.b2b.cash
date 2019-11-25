import {Routes, RouterModule} from '@angular/router';
import {BillingComponent} from './billing.component';

const routes: Routes = [
  {
    path: '',
    component: BillingComponent,
    children: [
      {
        path: '',
        loadChildren: './billing-activities/billing-activities.module#BillingActivitiesModule'
      },
      {
        path: ':activityNameId/baseline',
        loadChildren: './baseline/baseline.module#BaselineModule'
      },
      {
        path: ':activityNameId/coefficient',
        loadChildren: './coefficient/coefficient.module#CoefficientModule'
      },
    ]
  }
];

export const BillingRouting = RouterModule.forChild(routes);
