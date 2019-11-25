import {Routes, RouterModule} from '@angular/router';
import {SentComponent} from './sent.component';

const routes: Routes = [
  {path: '', component: SentComponent}
];

export const SENT_ROUTING = RouterModule.forChild(routes);
