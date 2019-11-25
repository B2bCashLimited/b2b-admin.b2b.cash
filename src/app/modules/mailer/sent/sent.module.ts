import {NgModule} from '@angular/core';
import {SENT_ROUTING} from './sent-routing';
import {SentComponent} from './sent.component';
import {SharedModule} from '@b2b/shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    SENT_ROUTING
  ],
  declarations: [SentComponent]
})
export class SentModule {
}
