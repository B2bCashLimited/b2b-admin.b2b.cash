import { Routes, RouterModule } from '@angular/router';
import { ProductsXmlComponent } from './products-xml.component';

const routes: Routes = [
  { path: '', component: ProductsXmlComponent },
];

export const PRODUCTS_XML_ROUTING = RouterModule.forChild(routes);
