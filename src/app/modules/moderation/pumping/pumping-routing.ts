import {Routes, RouterModule} from '@angular/router';
import {PumpingComponent} from './pumping.component';

const routes: Routes = [
  {path: '', component: PumpingComponent}
];

export const PUMPING_ROUTING = RouterModule.forChild(routes);
