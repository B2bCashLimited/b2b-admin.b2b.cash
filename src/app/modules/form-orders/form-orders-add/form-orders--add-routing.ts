import {Routes, RouterModule} from '@angular/router';
import {FormOrdersAddComponent} from './form-orders-add.component';

const routes: Routes = [
  {path: '', component: FormOrdersAddComponent}
];

export const ADD_ROUTING = RouterModule.forChild(routes);
