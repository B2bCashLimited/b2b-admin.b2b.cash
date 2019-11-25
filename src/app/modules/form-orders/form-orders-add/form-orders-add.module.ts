import {NgModule} from '@angular/core';
import {ADD_ROUTING} from './form-orders--add-routing';
import {FormOrdersAddComponent} from './form-orders-add.component';
import {SharedModule} from '@b2b/shared/shared.module';
import {OrderBusinessPropertyDialogComponent} from './dialogs/order-business-property-dialog/order-business-property-dialog.component';
import {ConfirmDeleteComponent} from './dialogs/confirm-delete/confirm-delete.component';

@NgModule({
  imports: [
    SharedModule,
    ADD_ROUTING
  ],
  declarations: [
    FormOrdersAddComponent,
    OrderBusinessPropertyDialogComponent,
    ConfirmDeleteComponent,
  ],
  entryComponents: [
    ConfirmDeleteComponent,
    OrderBusinessPropertyDialogComponent,
  ]
})
export class FormOrdersAddModule {
}
