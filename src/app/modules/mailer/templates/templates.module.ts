import {NgModule} from '@angular/core';
import {TEMPLATES_ROUTING} from './templates-routing';
import {TemplatesComponent} from './templates.component';
import {SharedModule} from '@b2b/shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    TEMPLATES_ROUTING
  ],
  declarations: [
    TemplatesComponent
  ]
})
export class TemplatesModule {
}
