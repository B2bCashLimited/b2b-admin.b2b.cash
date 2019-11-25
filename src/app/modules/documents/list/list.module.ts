import { NgModule } from '@angular/core';
import { SharedModule } from '@b2b/shared/shared.module';
import { ListRouting } from './list-routing';
import { ListComponent } from './list.component';

@NgModule({
  imports: [
    SharedModule,
    ListRouting
  ],
  declarations: [ListComponent],
})
export class ListModule {
}
