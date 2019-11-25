// Modules
import {NgModule} from '@angular/core';
import {SharedModule} from '@b2b/shared/shared.module';

// Components
import {UnitsComponent} from './units.component';
import {UnitDialogComponent} from './dialogs/unit-dialog/unit-dialog.component';

// Others
import {UNITS_ROUTING} from './units-routing';
import {ConfirmDeleteComponent} from './dialogs/confirm-delete/confirm-delete.component';

@NgModule({
  imports: [
    SharedModule,
    UNITS_ROUTING
  ],
  declarations: [
    UnitsComponent,
    UnitDialogComponent,
    ConfirmDeleteComponent,
  ],
  entryComponents: [
    UnitDialogComponent,
    ConfirmDeleteComponent,
  ]
})
export class UnitsModule {
}
