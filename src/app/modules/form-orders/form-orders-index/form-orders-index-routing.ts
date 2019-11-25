import {Routes, RouterModule} from '@angular/router';
import {FormOrdersIndexComponent} from './form-orders-index.component';

const routes: Routes = [
  {path: '', component: FormOrdersIndexComponent}
];

export const FORM_ORDERS_INDEX_ROUTING = RouterModule.forChild(routes);
