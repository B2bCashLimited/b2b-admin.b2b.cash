import {NgModule} from '@angular/core';
import {ROLES_EDIT_ROUTING} from './roles-edit-routing';
import {RolesEditComponent} from './roles-edit.component';
import {SharedModule} from '@b2b/shared/shared.module';
import {LanguagesDialogComponent} from '../dialogs/languages-dialog/languages-dialog.component';
import {WorkingScheduleModule} from '@b2b/components/working-schedule/working-schedule.module';

@NgModule({
  declarations: [
    RolesEditComponent,
    LanguagesDialogComponent
  ],
  entryComponents: [
    LanguagesDialogComponent,
  ],
  imports: [
    SharedModule,
    ROLES_EDIT_ROUTING,
    WorkingScheduleModule
  ]
})
export class RolesEditModule {
}
