import {Routes, RouterModule} from '@angular/router';
import {FormOrdersComponent} from './form-orders.component';

const routes: Routes = [
  {
    path: '',
    component: FormOrdersComponent,
    children: [
      {
        path: '',
        loadChildren: './form-orders-index/form-orders-index.module#FormOrdersIndexModule'
      },
      {
        path: 'add/:categoryId',
        loadChildren: './form-orders-add/form-orders-add.module#FormOrdersAddModule'
      },
      {
        path: 'add',
        redirectTo: '/form-orders'
      },
    ]
  }
];

export const FORM_ORDERS_ROUTING = RouterModule.forChild(routes);
