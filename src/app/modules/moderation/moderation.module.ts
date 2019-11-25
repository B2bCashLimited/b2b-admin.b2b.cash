import {NgModule} from '@angular/core';
import {ModerationRouting} from './moderation-routing';
import {ModerationComponent} from './moderation.component';
import {SharedModule} from '@b2b/shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    ModerationRouting
  ],
  declarations: [ModerationComponent]
})
export class ModerationModule {
}
