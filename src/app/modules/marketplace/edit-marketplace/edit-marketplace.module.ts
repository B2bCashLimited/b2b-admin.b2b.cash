import { NgModule } from '@angular/core';
import { SharedModule } from '@b2b/shared/shared.module';
import { EditMarketplaceComponent } from './edit-marketplace.component';
import { EDIT_MARKETPLACE_ROUTING } from './edit-marketplace-routing';

@NgModule({
  imports: [
    SharedModule,
    EDIT_MARKETPLACE_ROUTING
  ],
  declarations: [EditMarketplaceComponent],
})
export class EditMarketplaceModule {
}
