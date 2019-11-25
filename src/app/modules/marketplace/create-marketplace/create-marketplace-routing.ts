import {Routes, RouterModule} from '@angular/router';
import {CreateMarketplaceComponent} from './create-marketplace.component';

const routes: Routes = [
  {path: '', component: CreateMarketplaceComponent}
];

export const CREATE_MARKETPLACE_ROUTING = RouterModule.forChild(routes);
