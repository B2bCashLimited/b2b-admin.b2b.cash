import {NgModule} from '@angular/core';
import {TEMPLATES_NEW_ROUTING} from './templates-new-routing';
import {TemplatesNewComponent} from './templates-new.component';
import {SharedModule} from '@b2b/shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    TEMPLATES_NEW_ROUTING
  ],
  declarations: [
    TemplatesNewComponent
  ]
})
export class TemplatesNewModule {
}
