import {Routes, RouterModule} from '@angular/router';
import {MailerComponent} from './mailer.component';
import {NgxPermissionsGuard} from 'ngx-permissions';
import {Permissions} from '@b2b/enums';

const routes: Routes = [
  {
    path: '',
    component: MailerComponent,
    children: [
      {
        path: '',
        redirectTo: 'compose'
      },
      {
        path: 'compose',
        loadChildren: './compose/compose.module#ComposeModule',
        canActivate: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: [
              Permissions.SUPER_ADMIN,
              Permissions.MAILER_FULL_ACCESS
            ],
            redirectTo: '/'
          }
        }
      },
      {
        path: 'templates',
        loadChildren: './templates/templates.module#TemplatesModule',
        canActivate: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: [
              Permissions.SUPER_ADMIN,
              Permissions.MAILER_FULL_ACCESS,
              Permissions.MAILER_VIEW
            ],
            redirectTo: '/'
          }
        }
      },
      {
        path: 'sent',
        loadChildren: './sent/sent.module#SentModule',
        canActivate: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: [
              Permissions.SUPER_ADMIN,
              Permissions.MAILER_FULL_ACCESS,
              Permissions.MAILER_VIEW
            ],
            redirectTo: '/'
          }
        }
      },
      {
        path: 'lists',
        loadChildren: './lists/lists.module#ListsModule',
        canActivate: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: [
              Permissions.SUPER_ADMIN,
              Permissions.MAILER_FULL_ACCESS
            ],
            redirectTo: '/'
          }
        }
      },
    ]
  }
];

export const MAILER_ROUTING = RouterModule.forChild(routes);
