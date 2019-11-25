import {NgModule} from '@angular/core';
import {EmployeesRouting} from './employees-routing';
import {EmployeesComponent} from './employees.component';
import {SharedModule} from '@b2b/shared/shared.module';
import {EmployeeDialogComponent} from './dialogs/employee-dialog/employee-dialog.component';
import {ConfirmDeleteEmployeeDialogComponent} from './dialogs/confirm-delete-employee-dialog/confirm-delete-employee-dialog.component';

@NgModule({
  imports: [
    SharedModule,
    EmployeesRouting
  ],
  declarations: [
    EmployeesComponent,
    EmployeeDialogComponent,
    ConfirmDeleteEmployeeDialogComponent
  ],
  entryComponents: [
    EmployeeDialogComponent,
    ConfirmDeleteEmployeeDialogComponent
  ]
})
export class EmployeesModule {
}
