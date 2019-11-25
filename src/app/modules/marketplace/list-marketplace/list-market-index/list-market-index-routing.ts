import {Routes, RouterModule} from '@angular/router';
import {ListMarketIndexComponent} from './list-market-index.component';

const routes: Routes = [
  {
    path: '',
    component: ListMarketIndexComponent
  }
];

export const LIST_MARKETPLACE_INDEX_ROUTING = RouterModule.forChild(routes);
