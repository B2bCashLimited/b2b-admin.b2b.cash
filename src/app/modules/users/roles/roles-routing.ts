import {Routes, RouterModule} from '@angular/router';
import {RolesComponent} from './roles.component';
import {RoleResolver} from './role.resolver';

const routes: Routes = [
  {
    path: '',
    component: RolesComponent,
    children: [
      {
        path: '',
        loadChildren: './roles-index/roles-index.module#RolesIndexModule'
      },
      {
        path: 'new',
        loadChildren: './roles-edit/roles-edit.module#RolesEditModule',
        data: {
          isNewRole: true,
        }
      },
      {
        path: 'edit/:roleId',
        loadChildren: './roles-edit/roles-edit.module#RolesEditModule',
        resolve: {
          role: RoleResolver,
        },
        data: {
          isNewRole: false,
        }
      },
      {
        path: 'edit',
        redirectTo: 'users/roles'
      },
      {
        path: 'clone/:roleId',
        loadChildren: './roles-edit/roles-edit.module#RolesEditModule',
        resolve: {
          role: RoleResolver,
        },
        data: {
          isNewRole: true,
        }
      },
      {
        path: 'clone',
        redirectTo: 'users/roles'
      },
    ]
  }
];

export const RolesRouting = RouterModule.forChild(routes);
