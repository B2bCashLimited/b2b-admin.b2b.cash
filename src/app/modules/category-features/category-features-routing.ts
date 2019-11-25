import {Routes, RouterModule} from '@angular/router';
import {CategoryFeaturesComponent} from './category-features.component';

const routes: Routes = [
  {
    path: '',
    component: CategoryFeaturesComponent,
    children: [
      {
        path: '',
        loadChildren: './category-features-index/category-features-index.module#CategoryFeaturesIndexModule'
      },
      {
        path: 'add/:categoryId',
        loadChildren: './category-features-add/category-features-add.module#CategoryFeaturesAddModule'
      },
      {
        path: 'add',
        redirectTo: '/category-features'
      },
    ]
  }
];

export const CATEGORY_FEATURES_ROUTING = RouterModule.forChild(routes);
