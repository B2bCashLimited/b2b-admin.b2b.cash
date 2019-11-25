import {Routes, RouterModule} from '@angular/router';
import {CategoryFeaturesIndexComponent} from './category-features-index.component';

const routes: Routes = [
  {path: '', component: CategoryFeaturesIndexComponent}
];

export const CATEGORY_FEATURES_INDEX_ROUTING = RouterModule.forChild(routes);
