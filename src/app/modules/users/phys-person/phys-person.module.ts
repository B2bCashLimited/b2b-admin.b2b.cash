import { NgModule } from '@angular/core';
import { PHYS_PERSON_ROUTING } from './phys-person-routing';
import { PhysPersonComponent } from './phys-person.component';
import { SharedModule } from '@b2b/shared/shared.module';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { ConfirmDeleteComponent } from './dialogs/confirm-delete/confirm-delete.component';
import { AddUserDialogComponent } from './dialogs/add-user-dialog/add-user-dialog.component';

@NgModule({
  imports: [
    SharedModule,
    PHYS_PERSON_ROUTING,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
  ],
  declarations: [
    PhysPersonComponent,
    ConfirmDeleteComponent,
    AddUserDialogComponent
  ],
  entryComponents: [
    ConfirmDeleteComponent,
    AddUserDialogComponent
  ]
})
export class PhysPersonModule { }
