import {Routes, RouterModule} from '@angular/router';
import {SigninComponent} from './signin.component';

const routes: Routes = [
  {path: '', component: SigninComponent}
];

export const SIGNIN_ROUTING = RouterModule.forChild(routes);
