import {NgModule} from '@angular/core';
import {MANAGER_ROUTING} from './manager-routing';
import {ManagerComponent} from './manager.component';
import {SharedModule} from '@b2b/shared/shared.module';
import {AccessDeniedComponent} from './access-denied/access-denied.component';
import {NotEnoughConsultantsDialogComponent} from '../popups/not-enough-consultants-dialog/not-enough-consultants-dialog.component';
import {ConsultantSettingsDialogComponent} from '../popups/consultant-settings-dialog/consultant-settings-dialog.component';

@NgModule({
  imports: [
    SharedModule,
    MANAGER_ROUTING
  ],
  declarations: [
    ManagerComponent,
    AccessDeniedComponent,
    NotEnoughConsultantsDialogComponent,
    ConsultantSettingsDialogComponent,
  ],
  exports: [
    AccessDeniedComponent
  ],
  entryComponents: [
    NotEnoughConsultantsDialogComponent,
    ConsultantSettingsDialogComponent,
  ]
})
export class ManagerModule {
}
