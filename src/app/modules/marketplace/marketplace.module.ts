import { NgModule } from '@angular/core';
import { MarketplaceComponent } from './marketplace.component';
import { SharedModule } from '@b2b/shared/shared.module';
import { MarketplaceRouting } from './marketplace-routing';
import { EditMarketplaceResolver } from '@b2b/services/edit-marketplace-resolver';

@NgModule({
  imports: [
    SharedModule,
    MarketplaceRouting
  ],
  providers: [EditMarketplaceResolver],
  declarations: [MarketplaceComponent],
})
export class MarketplaceModule {
}
