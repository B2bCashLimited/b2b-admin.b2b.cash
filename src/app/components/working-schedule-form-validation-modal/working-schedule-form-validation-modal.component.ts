import {
  ChangeDetectionStrategy,
  Component,
  Inject
} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

export interface WorkingScheduleFormValidationModalMatDialogData {
  errors: Array<string>;
}

@Component({
  templateUrl: './working-schedule-form-validation-modal.component.html',
  styleUrls: ['./working-schedule-form-validation-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkingScheduleFormValidationModalComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: WorkingScheduleFormValidationModalMatDialogData) {
  }
}
