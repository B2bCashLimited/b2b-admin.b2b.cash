import {Routes, RouterModule} from '@angular/router';
import {CompaniesComponent} from './companies.component';

const routes: Routes = [
  {path: '', component: CompaniesComponent}
];

export const COMPANIES_ROUTING = RouterModule.forChild(routes);
