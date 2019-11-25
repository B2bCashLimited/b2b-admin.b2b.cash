import {Routes, RouterModule} from '@angular/router';
import {ActivitiesComponent} from './activities.component';

const routes: Routes = [
  {
    path: '',
    component: ActivitiesComponent,
    children: [
      {
        path: '',
        loadChildren: './activities-index/activities-index.module#ActivitiesIndexModule'
      },
      {
        path: 'details',
        loadChildren: './activity-details/activity-details.module#ActivityDetailsModule'
      }
    ]
  }
];

export const ACTIVITIES_ROUTING = RouterModule.forChild(routes);
