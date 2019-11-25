import {Routes, RouterModule} from '@angular/router';
import {CategoryFeaturesAddComponent} from './category-features-add.component';

const routes: Routes = [
  {path: '', component: CategoryFeaturesAddComponent}
];

export const CATEGORY_FEATURES_ADD_ROUTING = RouterModule.forChild(routes);
