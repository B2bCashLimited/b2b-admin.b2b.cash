import {Routes, RouterModule} from '@angular/router';
import {EditMarketplaceComponent} from './edit-marketplace.component';

const routes: Routes = [
  {path: '', component: EditMarketplaceComponent}
];

export const EDIT_MARKETPLACE_ROUTING = RouterModule.forChild(routes);
