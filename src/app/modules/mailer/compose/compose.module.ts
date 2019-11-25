import {NgModule} from '@angular/core';
import {COMPOSE_ROUTING} from './compose-routing';
import {ComposeComponent} from './compose.component';
import {SharedModule} from '@b2b/shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    COMPOSE_ROUTING
  ],
  declarations: [
    ComposeComponent,
  ]
})
export class ComposeModule {
}
