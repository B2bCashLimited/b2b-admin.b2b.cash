import {Routes, RouterModule} from '@angular/router';
import {ModerationComponent} from './moderation.component';

const routes: Routes = [
  {
    path: '',
    component: ModerationComponent,
    children: [
      {
        path: '',
        redirectTo: 'products'
      },
      {
        path: 'products',
        loadChildren: './products/products.module#ProductsModule'
      },
      {
        path: 'products-xml',
        loadChildren: './products-xml/products-xml.module#ProductsXmlModule'
      },
      {
        path: 'products-xls',
        loadChildren: './products-xls/products-xls.module#ProductsXlsModule'
      },
      {
        path: 'companies',
        loadChildren: './companies/companies.module#CompaniesModule'
      },
      {
        path: 'pumping',
        loadChildren: './pumping/pumping.module#PumpingModule'
      },
      {
        path: 'ratings',
        loadChildren: './ratings/ratings.module#RatingsModule'
      },
      {
        path: 'update-order',
        loadChildren: './update-order/update-order.module#UpdateOrderModule'
      },
      {
        path: 'activities',
        loadChildren: './activities/activities.module#ActivitiesModule'
      },
    ]
  }
];

export const ModerationRouting = RouterModule.forChild(routes);
