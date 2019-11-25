import {NgModule} from '@angular/core';
import {CoefficientRoutingModule} from './coefficient.routing';
import {CoefficientComponent} from './coefficient.component';
import {SharedModule} from '@b2b/shared/shared.module';
import {ProductCoefficientComponent} from './components/product-coefficient/product-coefficient.component';
import {CustomsCoefficientComponent} from './components/customs-coefficient/customs-coefficient.component';
import {AutoTarifCompleteComponent} from './components/auto-complete/auto-complete.component';
import {CustomsService} from './services/customs.service';
import {TransportsService} from './services/transports.service';
import {LocalityService} from './services/locality.service';
import {StationCountryComponent} from './components/station-country/station-country.component';
import {CustomsRouteComponent} from './components/customs-route/customs-route.component';

@NgModule({
  declarations: [
    CoefficientComponent,
    ProductCoefficientComponent,
    CustomsCoefficientComponent,
    AutoTarifCompleteComponent,
    StationCountryComponent,
    CustomsRouteComponent
  ],
  imports: [
    SharedModule,
    CoefficientRoutingModule
  ],
  providers: [
    CustomsService,
    TransportsService,
    LocalityService,
  ]
})
export class CoefficientModule {
}
