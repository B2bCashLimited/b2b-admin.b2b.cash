import {Routes, RouterModule} from '@angular/router';
import {RolesEditComponent} from './roles-edit.component';

const routes: Routes = [
  {path: '', component: RolesEditComponent}
];

export const ROLES_EDIT_ROUTING = RouterModule.forChild(routes);
