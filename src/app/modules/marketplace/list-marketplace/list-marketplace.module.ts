import { NgModule } from '@angular/core';
import { SharedModule } from '@b2b/shared/shared.module';
import { ListMarketplaceComponent } from './list-marketplace.component';
import { LIST_MARKETPLACE_ROUTING } from './list-marketplace-routing';

@NgModule({
  imports: [
    SharedModule,
    LIST_MARKETPLACE_ROUTING
  ],
  declarations: [ListMarketplaceComponent],
})
export class ListMarketplaceModule {
}
