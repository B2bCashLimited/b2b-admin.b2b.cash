import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import {SharedModule} from '@b2b/shared/shared.module';
import {WorkingScheduleComponent} from '@b2b/components/working-schedule/working-schedule.component';
import {
  WorkingScheduleDeleteDialogComponent
} from '@b2b/components/working-schedule/working-schedule-delete-dialog/working-schedule-delete-dialog.component';
import {WorkingScheduleDialogComponent} from '@b2b/components/working-schedule/working-schedule-dialog/working-schedule-dialog.component';
import {
  WorkingScheduleFormValidationModalComponent
} from '@b2b/components/working-schedule-form-validation-modal/working-schedule-form-validation-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [
    WorkingScheduleComponent,
    WorkingScheduleDeleteDialogComponent,
    WorkingScheduleDialogComponent,
    WorkingScheduleFormValidationModalComponent
  ],
  entryComponents: [
    WorkingScheduleDeleteDialogComponent,
    WorkingScheduleDialogComponent,
    WorkingScheduleFormValidationModalComponent
  ],
  exports: [
    WorkingScheduleComponent,
    WorkingScheduleDeleteDialogComponent,
    WorkingScheduleDialogComponent
  ]
})
export class WorkingScheduleModule {
}
