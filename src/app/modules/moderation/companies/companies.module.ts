import {NgModule} from '@angular/core';
import {COMPANIES_ROUTING} from './companies-routing';
import {CompaniesComponent} from './companies.component';
import {SharedModule} from '@b2b/shared/shared.module';
import {CompanyModerationService} from './company-moderation.service';
import {CompanyDetailsComponent} from './company-details/company-details.component';

@NgModule({
  imports: [
    SharedModule,
    COMPANIES_ROUTING
  ],
  declarations: [
    CompaniesComponent,
    CompanyDetailsComponent
  ],
  providers: [
    CompanyModerationService,
  ]
})
export class CompaniesModule {
}
