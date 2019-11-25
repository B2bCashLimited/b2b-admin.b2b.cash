import {Routes, RouterModule} from '@angular/router';
import {ProductCategoriesWrapComponent} from './product-categories-wrap.component';

const routes: Routes = [
  {path: '', component: ProductCategoriesWrapComponent}
];

export const ProductCategoriesRoutingModule = RouterModule.forChild(routes);
