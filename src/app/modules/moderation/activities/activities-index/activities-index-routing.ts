import {Routes, RouterModule} from '@angular/router';
import {ActivitiesIndexComponent} from './activities-index.component';

const routes: Routes = [
  {path: '', component: ActivitiesIndexComponent}
];

export const ACTIVITIES_INDEX_ROUTING = RouterModule.forChild(routes);
