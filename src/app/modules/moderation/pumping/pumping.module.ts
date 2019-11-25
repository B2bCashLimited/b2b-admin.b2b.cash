import {NgModule} from '@angular/core';
import {PUMPING_ROUTING} from './pumping-routing';
import {PumpingComponent} from './pumping.component';
import {SharedModule} from '@b2b/shared/shared.module';
import {ConfirmDestroyDialogComponent} from './dialogs/confirm-destroy-dialog/confirm-destroy-dialog.component';

@NgModule({
  imports: [
    SharedModule,
    PUMPING_ROUTING
  ],
  declarations: [
    PumpingComponent,
    ConfirmDestroyDialogComponent,
  ],
  entryComponents: [
    ConfirmDestroyDialogComponent,
  ]
})
export class PumpingModule {
}
