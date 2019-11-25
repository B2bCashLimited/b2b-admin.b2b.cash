import {Routes, RouterModule} from '@angular/router';
import {ListMarketplaceComponent} from './list-marketplace.component';

const routes: Routes = [
  {
    path: '',
    component: ListMarketplaceComponent,
    children: [
      {
        path: '',
        loadChildren: './list-market-index/list-market-index.module#ListMarketplaceIndexModule'
      }
    ]
  }
];

export const LIST_MARKETPLACE_ROUTING = RouterModule.forChild(routes);
