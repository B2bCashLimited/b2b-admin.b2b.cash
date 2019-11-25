import {Routes, RouterModule} from '@angular/router';
import {ShowcaseAnalyticsComponent} from './showcase-analytics.component';

const routes: Routes = [
  {path: '', component: ShowcaseAnalyticsComponent}
];

export const ShowcaseAnalyticsRouting = RouterModule.forChild(routes);
