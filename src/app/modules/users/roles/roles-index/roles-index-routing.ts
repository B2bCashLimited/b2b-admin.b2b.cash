import {Routes, RouterModule} from '@angular/router';
import {RolesIndexComponent} from './roles-index.component';

const routes: Routes = [
  {path: '', component: RolesIndexComponent}
];

export const ROLES_INDEX_ROUTING = RouterModule.forChild(routes);
