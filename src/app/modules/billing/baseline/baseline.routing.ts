import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {BaselineComponent} from './baseline.component';

const routes: Routes = [
  {path: '', component: BaselineComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BaselineRoutingModule {
}
