
import { Routes, RouterModule } from '@angular/router';
import { UpdateOrderComponent } from './update-order.component';

const routes: Routes = [
  { path: '', component: UpdateOrderComponent }
];

export const UPDATE_ORDER_ROUTING = RouterModule.forChild(routes);
