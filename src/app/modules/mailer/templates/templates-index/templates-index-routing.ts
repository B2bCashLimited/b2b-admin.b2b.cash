import {Routes, RouterModule} from '@angular/router';
import {TemplatesIndexComponent} from './templates-index.component';

const routes: Routes = [
  {path: '', component: TemplatesIndexComponent}
];

export const TEMPLATES_INDEX_ROUTING = RouterModule.forChild(routes);
