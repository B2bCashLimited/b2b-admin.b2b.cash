import {Routes, RouterModule} from '@angular/router';
import {ChatsComponent} from './chats.component';

const routes: Routes = [
  {
    path: '',
    component: ChatsComponent,
    children: [
      {
        path: '',
        redirectTo: 'consultant',
      },
      {
        path: 'consultant',
        loadChildren: './consultant/consultant.module#ConsultantModule',
      },
      {
        path: 'manager',
        loadChildren: './manager/manager.module#ManagerModule',
      },
    ]
  }
];

export const CHATS_ROUTING = RouterModule.forChild(routes);
