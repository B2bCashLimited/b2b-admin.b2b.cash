import { Routes, RouterModule } from '@angular/router';
import { ProductsComponent } from './products.component';
import { ModerateProducsNamesComponent } from './moderate-producs-names/moderate-producs-names.component';

const routes: Routes = [
  { path: '', component: ProductsComponent },
  { path: 'products-names', component: ModerateProducsNamesComponent }
];

export const PRODUCTS_ROUTING = RouterModule.forChild(routes);
