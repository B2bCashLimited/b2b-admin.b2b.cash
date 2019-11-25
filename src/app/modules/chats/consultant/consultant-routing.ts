import {Routes, RouterModule} from '@angular/router';
import {ConsultantComponent} from './consultant.component';

const routes: Routes = [
  {path: '', component: ConsultantComponent}
];

export const CONSULTANT_ROUTING = RouterModule.forChild(routes);
