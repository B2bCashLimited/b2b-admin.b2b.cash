import {Routes, RouterModule} from '@angular/router';
import {TemplatesNewComponent} from './templates-new.component';

const routes: Routes = [
  {path: '', component: TemplatesNewComponent}
];

export const TEMPLATES_NEW_ROUTING = RouterModule.forChild(routes);
