import {NgModule} from '@angular/core';
import {RequisitesSettingsRoutes} from './requisites-settings-routings';
import {SharedModule} from '@b2b/shared/shared.module';
import {RequisitesSettingsComponent} from './requisites-settings.component';
import {RequisitesTemplateDeleteDialogComponent} from './requisites-template-delete-dialog/requisites-template-delete-dialog.component';
import { RequisiteTemplateCreateDialogComponent } from './requisite-template-create-dialog/requisite-template-create-dialog.component';

@NgModule({
  imports: [
    SharedModule,
    RequisitesSettingsRoutes
  ],
  declarations: [
    RequisitesSettingsComponent,
    RequisitesTemplateDeleteDialogComponent,
    RequisiteTemplateCreateDialogComponent,
  ],
  entryComponents: [
    RequisitesTemplateDeleteDialogComponent,
    RequisiteTemplateCreateDialogComponent,
  ]
})
export class RequisitesSettingsModule {
}
