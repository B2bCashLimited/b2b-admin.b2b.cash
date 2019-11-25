import { Routes, RouterModule } from '@angular/router';
import { PlatformStatisticsComponent } from './platform-statistics.component';

const routes: Routes = [
  {
    path: '',
    component: PlatformStatisticsComponent
  }
];

export const PlatformStatisticsRouting = RouterModule.forChild(routes);
