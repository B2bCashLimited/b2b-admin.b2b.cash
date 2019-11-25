import {Routes, RouterModule} from '@angular/router';
import {RatingsComponent} from './ratings.component';

const routes: Routes = [
  {path: '', component: RatingsComponent}
];

export const RATINGS_ROUTING = RouterModule.forChild(routes);
