import {NgModule} from '@angular/core';
import {BillingRouting} from './billing-routing';
import {BillingComponent} from './billing.component';
import {SharedModule} from '@b2b/shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    BillingRouting
  ],
  declarations: [
    BillingComponent
  ]
})
export class BillingModule {
}
