import { Routes, RouterModule } from '@angular/router';
import { PhysPersonComponent } from './phys-person.component';

const routes: Routes = [
  {path: '', component: PhysPersonComponent}
];

export const PHYS_PERSON_ROUTING = RouterModule.forChild(routes);
