import {Routes, RouterModule} from '@angular/router';
import {PlatformComponent} from './platform.component';

const routes: Routes = [
  {path: '', component: PlatformComponent}
];

export const PLATFORM_ROUTING = RouterModule.forChild(routes);
