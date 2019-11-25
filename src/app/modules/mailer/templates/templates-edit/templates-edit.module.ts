import {NgModule} from '@angular/core';
import {TEMPLATES_EDIT_ROUTING} from './templates-edit-routing';
import {TemplatesEditComponent} from './templates-edit.component';
import {SharedModule} from '@b2b/shared/shared.module';
import {QuillModule} from 'ngx-quill';
import {MailerTextAreaComponent} from './components/mailer-text-area/mailer-text-area.component';

@NgModule({
  imports: [
    SharedModule,
    QuillModule,
    TEMPLATES_EDIT_ROUTING
  ],
  declarations: [
    TemplatesEditComponent,
    MailerTextAreaComponent
  ],
  exports: [
    MailerTextAreaComponent
  ]
})
export class TemplatesEditModule {
}
