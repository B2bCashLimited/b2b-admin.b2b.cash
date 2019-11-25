import {RouterModule, Routes} from '@angular/router';
import {RequisitesSettingsComponent} from './requisites-settings.component';

const routes: Routes = [
  {
    path: '',
    component: RequisitesSettingsComponent
  }
];

export const RequisitesSettingsRoutes = RouterModule.forChild(routes);
