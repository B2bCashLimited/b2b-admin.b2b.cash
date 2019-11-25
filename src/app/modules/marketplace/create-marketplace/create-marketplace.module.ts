import { NgModule } from '@angular/core';
import { SharedModule } from '@b2b/shared/shared.module';
import { CreateMarketplaceComponent } from './create-marketplace.component';
import { CREATE_MARKETPLACE_ROUTING } from './create-marketplace-routing';

@NgModule({
  imports: [
    SharedModule,
    CREATE_MARKETPLACE_ROUTING
  ],
  declarations: [CreateMarketplaceComponent],
})
export class CreateMarketplaceModule {
}
