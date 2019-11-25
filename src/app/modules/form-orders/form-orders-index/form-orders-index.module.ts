import {NgModule} from '@angular/core';
import {FORM_ORDERS_INDEX_ROUTING} from './form-orders-index-routing';
import {FormOrdersIndexComponent} from './form-orders-index.component';
import {SharedModule} from '@b2b/shared/shared.module';
import {FormOrdersItemComponent} from '../components/form-orders-item/form-orders-item.component';

@NgModule({
  imports: [
    SharedModule,
    FORM_ORDERS_INDEX_ROUTING
  ],
  exports: [
    FormOrdersItemComponent
  ],
  declarations: [
    FormOrdersIndexComponent,
    FormOrdersItemComponent
  ]
})
export class FormOrdersIndexModule {
}
