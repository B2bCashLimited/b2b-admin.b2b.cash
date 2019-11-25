import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './list.component';

const routes: Routes = [
  {
    path: '',
    component: ListComponent
  },
  {
    path: ':id',
    loadChildren: './act-invoice-template/act-invoice-template.module#ActInvoiceTemplateModule'
  },
];

export const ListRouting = RouterModule.forChild(routes);
