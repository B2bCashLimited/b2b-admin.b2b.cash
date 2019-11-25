import {NgModule} from '@angular/core';
import {ShowcaseAnalyticsRouting} from './showcase-analytics-routing';
import {ShowcaseAnalyticsComponent} from './showcase-analytics.component';
import {SharedModule} from '@b2b/shared/shared.module';
import {HttpService} from '../../moderation/products/http.service';
import {WindowsListService} from '../../moderation/products/windows-list.service';
import {AccessDeniedComponent} from './access-denied/access-denied.component';

@NgModule({
  imports: [
    SharedModule,
    ShowcaseAnalyticsRouting
  ],
  declarations: [
    ShowcaseAnalyticsComponent,
    AccessDeniedComponent,
  ],
  exports: [
    AccessDeniedComponent,
  ],
  providers: [
    HttpService,
    WindowsListService
  ]
})
export class ShowcaseAnalyticsModule {
}
