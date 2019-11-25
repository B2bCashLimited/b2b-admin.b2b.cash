import { Routes, RouterModule } from '@angular/router';
import { ProductsXlsComponent } from './products-xls.component';

const routes: Routes = [
  { path: '', component: ProductsXlsComponent },
];

export const PRODUCTS_XLS_ROUTING = RouterModule.forChild(routes);
