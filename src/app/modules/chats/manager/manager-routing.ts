import {RouterModule, Routes} from '@angular/router';
import {ManagerComponent} from './manager.component';

const routes: Routes = [
  {path: '', component: ManagerComponent}
];

export const MANAGER_ROUTING = RouterModule.forChild(routes);
