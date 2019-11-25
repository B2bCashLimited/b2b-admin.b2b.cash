import {Routes, RouterModule} from '@angular/router';
import {ComposeComponent} from './compose.component';

const routes: Routes = [
  {path: '', component: ComposeComponent}
];

export const COMPOSE_ROUTING = RouterModule.forChild(routes);
