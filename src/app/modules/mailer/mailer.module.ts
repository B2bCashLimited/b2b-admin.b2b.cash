import {NgModule} from '@angular/core';
import {MAILER_ROUTING} from './mailer-routing';
import {MailerComponent} from './mailer.component';
import {SharedModule} from '@b2b/shared/shared.module';
import {MailerService} from './mailer.service';

@NgModule({
  imports: [
    SharedModule,
    MAILER_ROUTING
  ],
  declarations: [
    MailerComponent
  ],
  providers: [
    MailerService
  ]
})
export class MailerModule {
}
