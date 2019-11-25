import { Routes, RouterModule } from '@angular/router';
import { StatisticsAndAnalyticsComponent } from './statistics-and-analytics.component';

const routes: Routes = [
  {
    path: '',
    component: StatisticsAndAnalyticsComponent,
    children: [
      {
        path: '',
        redirectTo: 'platform',
      },
      {
        path: 'platform',
        loadChildren: './platform-statistics/platform-statistics.module#PlatformStatisticsModule',
      },
      {
        path: 'showcase',
        loadChildren: './showcase-analytics/showcase-analytics.module#ShowcaseAnalyticsModule',
      },
    ]
  }
];

export const StatisticsAndAnalyticsRouting = RouterModule.forChild(routes);
