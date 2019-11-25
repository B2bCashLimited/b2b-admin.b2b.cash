import {NgModule} from '@angular/core';
import {FORM_ORDERS_ROUTING} from './form-orders-routing';
import {FormOrdersComponent} from './form-orders.component';
import {SharedModule} from '@b2b/shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    FORM_ORDERS_ROUTING
  ],
  declarations: [
    FormOrdersComponent
  ]
})
export class FormOrdersModule {
}
