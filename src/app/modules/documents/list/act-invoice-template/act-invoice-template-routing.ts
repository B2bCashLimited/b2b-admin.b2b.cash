import { RouterModule, Routes } from '@angular/router';
import { ActInvoiceTemplateComponent } from './act-invoice-template.component';

const routes: Routes = [
  {
    path: '',
    component: ActInvoiceTemplateComponent
  }
];

export const ActInvoiceTemplateRouting = RouterModule.forChild(routes);
