import {NgModule} from '@angular/core';
import {AdminIndexRouting} from './admin-index-routing';
import {AdminIndexComponent} from './admin-index.component';
import {SharedModule} from '@b2b/shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    AdminIndexRouting
  ],
  declarations: [
    AdminIndexComponent
  ]
})
export class AdminIndexModule {
}
