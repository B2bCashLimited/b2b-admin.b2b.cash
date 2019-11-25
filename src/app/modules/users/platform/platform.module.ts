import { NgModule } from '@angular/core';
import { PLATFORM_ROUTING } from './platform-routing';
import { PlatformComponent } from './platform.component';
import { SharedModule } from '@b2b/shared/shared.module';
import { AddUserDialogComponent } from './dialogs/add-user-dialog/add-user-dialog.component';
import { ConfirmDeleteComponent } from './dialogs/confirm-delete/confirm-delete.component';
import { EmployeesDialogComponent } from './dialogs/employees/employees-dialog.component';

@NgModule({
  imports: [
    SharedModule,
    PLATFORM_ROUTING,
  ],
  declarations: [
    PlatformComponent,
    AddUserDialogComponent,
    ConfirmDeleteComponent,
    EmployeesDialogComponent,
  ],
  entryComponents: [
    AddUserDialogComponent,
    ConfirmDeleteComponent,
    EmployeesDialogComponent,
  ]
})
export class PlatformModule {
}
