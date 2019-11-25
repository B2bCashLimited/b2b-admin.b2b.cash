import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {CoefficientComponent} from './coefficient.component';

const routes: Routes = [
  { path: '', component: CoefficientComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CoefficientRoutingModule {
}
