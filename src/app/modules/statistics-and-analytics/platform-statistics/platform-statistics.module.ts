import { NgModule } from '@angular/core';
import { PlatformStatisticsRouting } from './platform-statistics-routing';
import { PlatformStatisticsComponent } from './platform-statistics.component';
import { SharedModule } from '@b2b/shared/shared.module';
import { AccessDeniedComponent } from './access-denied/access-denied.component';
import { StatisticsOrdersOffersPipe } from '@b2b/pipes';
import { SelectCityForCustomsPostComponent } from './components/select-city-for-customs-post/select-city-for-customs-post.component';
import { SelectProductsComponent } from './components/select-products/select-products.component';
import { EmailListComponent } from './dialogs/email-list/email-list.component';

@NgModule({
  imports: [
    SharedModule,
    PlatformStatisticsRouting
  ],
  declarations: [
    PlatformStatisticsComponent,
    AccessDeniedComponent,
    StatisticsOrdersOffersPipe,
    SelectCityForCustomsPostComponent,
    SelectProductsComponent,
    EmailListComponent,
  ],
  entryComponents: [EmailListComponent]
})
export class PlatformStatisticsModule {
}
