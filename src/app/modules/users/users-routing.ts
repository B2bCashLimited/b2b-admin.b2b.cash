import {Routes, RouterModule} from '@angular/router';
import {UsersComponent} from './users.component';

const routes: Routes = [
  {
    path: '',
    component: UsersComponent,
    children: [
      {
        path: '',
        redirectTo: 'platform'
      },
      {
        path: 'platform',
        loadChildren: './platform/platform.module#PlatformModule'
      },
      {
        path: 'phys-person',
        loadChildren: './phys-person/phys-person.module#PhysPersonModule'
      },
      {
        path: 'employees',
        loadChildren: './employees/employees.module#EmployeesModule'
      },
      {
        path: 'roles',
        loadChildren: './roles/roles.module#RolesModule'
      },
    ]
  }
];

export const USERS_ROUTING = RouterModule.forChild(routes);
