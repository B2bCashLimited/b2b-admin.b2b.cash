import {Routes, RouterModule} from '@angular/router';
import {UnitsComponent} from './units.component';

const routes: Routes = [
  {path: '', component: UnitsComponent}
];

export const UNITS_ROUTING = RouterModule.forChild(routes);
