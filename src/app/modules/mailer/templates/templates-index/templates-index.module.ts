import {NgModule} from '@angular/core';
import {TEMPLATES_INDEX_ROUTING} from './templates-index-routing';
import {TemplatesIndexComponent} from './templates-index.component';
import {SharedModule} from '@b2b/shared/shared.module';
import {ConfirmDeleteTemplateComponent} from './dialogs/confirm-delete-template/confirm-delete-template.component';

@NgModule({
  imports: [
    SharedModule,
    TEMPLATES_INDEX_ROUTING
  ],
  declarations: [
    TemplatesIndexComponent
  ]
})
export class TemplatesIndexModule {
}
