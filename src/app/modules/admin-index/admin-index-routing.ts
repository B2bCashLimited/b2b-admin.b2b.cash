import {Routes, RouterModule} from '@angular/router';
import {AdminIndexComponent} from './admin-index.component';
import {AuthGuard} from '../../core/guards/auth.guard';
import {NgxPermissionsGuard} from 'ngx-permissions';
import {Permissions} from '@b2b/enums';

const routes: Routes = [
  {
    path: '',
    component: AdminIndexComponent,
    children: [
      {
        path: '',
        loadChildren: '../dashboard/dashboard.module#DashboardModule'
      },
      {
        path: 'form-orders',
        loadChildren: '../form-orders/form-orders.module#FormOrdersModule',
        canActivate: [AuthGuard],
        canActivateChild: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: [
              Permissions.SUPER_ADMIN,
              Permissions.FORM_ORDERS_VIEW,
            ],
            redirectTo: '/'
          }
        }
      },
      {
        path: 'category-features',
        loadChildren: '../category-features/category-features.module#CategoryFeaturesModule',
        canActivate: [AuthGuard],
        canActivateChild: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: [
              Permissions.SUPER_ADMIN,
              Permissions.CATEGORY_FEATURES_VIEW,
            ],
            redirectTo: '/'
          }
        }
      },
      {
        path: 'product-categories',
        loadChildren: '../product-categories/product-categories.module#ProductCategoriesModule',
        canActivate: [AuthGuard],
        canActivateChild: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: [
              Permissions.SUPER_ADMIN,
              Permissions.PRODUCT_CATEGORIES_VIEW,
            ],
            redirectTo: '/'
          }
        }
      },
      {
        path: 'units',
        loadChildren: '../units/units.module#UnitsModule',
        canActivate: [AuthGuard],
        canActivateChild: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: [
              Permissions.SUPER_ADMIN,
              Permissions.UNITS_VIEW,
            ],
            redirectTo: '/'
          }
        }
      },
      {
        path: 'moderation',
        loadChildren: '../moderation/moderation.module#ModerationModule',
        canActivate: [AuthGuard],
        canActivateChild: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: [
              Permissions.SUPER_ADMIN,
              Permissions.MODERATE_PRODUCTS_VIEW,
              Permissions.MODERATE_COMPANIES_VIEW,
              Permissions.MODERATE_PUMPING_VIEW,
              Permissions.MODERATE_ACTIVITIES_VIEW,
              Permissions.MODERATE_ORDER,
            ],
            redirectTo: '/'
          }
        }
      },
      {
        path: 'statistics-and-analytics',
        loadChildren: '../statistics-and-analytics/statistics-and-analytics.module#StatisticsAndAnalyticsModule',
        canActivate: [AuthGuard],
        canActivateChild: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: [
              Permissions.SUPER_ADMIN,
              Permissions.STATISTICS_AND_ANALYTICS_VIEW,
              Permissions.STATISTICS_AND_SHOWCASES_VIEW,
            ],
            redirectTo: '/'
          }
        }
      },
      {
        path: 'chats',
        loadChildren: '../chats/chats.module#ChatsModule',
        canActivate: [AuthGuard],
        canActivateChild: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: [
              Permissions.SUPER_ADMIN,
              Permissions.CHAT_MANAGER_VIEW,
              Permissions.CHAT_CONSULTANT_VIEW,
            ],
            redirectTo: '/'
          }
        }
      },
      {
        path: 'users',
        loadChildren: '../users/users.module#UsersModule',
        canActivate: [AuthGuard],
        canActivateChild: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: [
              Permissions.SUPER_ADMIN,
              Permissions.USERS_VIEW,
              Permissions.EMPLOYEES_VIEW,
              Permissions.ROLES_VIEW,
            ],
            redirectTo: '/'
          }
        }
      },
      {
        path: 'mailer',
        loadChildren: '../mailer/mailer.module#MailerModule',
        canActivate: [AuthGuard],
        canActivateChild: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: [
              Permissions.SUPER_ADMIN,
              Permissions.MAILER_VIEW,
            ],
            redirectTo: '/'
          }
        }
      },
      {
        path: 'billing',
        loadChildren: '../billing/billing.module#BillingModule',
        canActivate: [AuthGuard],
        canActivateChild: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: [
              Permissions.SUPER_ADMIN,
              Permissions.BILLING_VIEW,
            ],
            redirectTo: '/'
          }
        }
      },
      {
        path: 'documents',
        loadChildren: '../documents/documents.module#DocumentsModule',
        canActivate: [AuthGuard],
        canActivateChild: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: [
              Permissions.SUPER_ADMIN
            ],
            redirectTo: '/'
          }
        }
      },
      {
        path: 'marketplace',
        loadChildren: '../marketplace/marketplace.module#MarketplaceModule',
        canActivate: [AuthGuard],
        canActivateChild: [NgxPermissionsGuard],
      }
    ]
  }
];

export const AdminIndexRouting = RouterModule.forChild(routes);
