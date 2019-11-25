import {Routes, RouterModule} from '@angular/router';
import {TemplatesEditComponent} from './templates-edit.component';

const routes: Routes = [
  {path: '', component: TemplatesEditComponent}
];

export const TEMPLATES_EDIT_ROUTING = RouterModule.forChild(routes);
