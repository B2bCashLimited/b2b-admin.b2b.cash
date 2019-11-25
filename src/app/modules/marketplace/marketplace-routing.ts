import { Routes, RouterModule } from '@angular/router';
import { MarketplaceComponent } from './marketplace.component';
import { EditMarketplaceResolver } from '@b2b/services/edit-marketplace-resolver';

const routes: Routes = [
  {
    path: '',
    component: MarketplaceComponent,
    children: [
      {
        path: '',
        redirectTo: 'list-marketplace'
      },
      {
        path: 'create-marketplace',
        loadChildren: './create-marketplace/create-marketplace.module#CreateMarketplaceModule'
      },
      {
        path: 'list-marketplace',
        loadChildren: './list-marketplace/list-marketplace.module#ListMarketplaceModule'
      },
      {
        path: 'edit-marketplace/:marketId',
        loadChildren: './edit-marketplace/edit-marketplace.module#EditMarketplaceModule',
        resolve: {
          countryDetail: EditMarketplaceResolver
        }
      }
    ]
  }
];

export const MarketplaceRouting = RouterModule.forChild(routes);
