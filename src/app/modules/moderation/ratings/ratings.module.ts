import {NgModule} from '@angular/core';
import {RATINGS_ROUTING} from './ratings-routing';
import {RatingsComponent} from './ratings.component';
import {SharedModule} from '@b2b/shared/shared.module';
import { DeleteTemplateDialogComponent } from './dialogs/delete-template-dialog/delete-template-dialog.component';
import { ConfigureRatingDialogComponent } from './dialogs/configure-rating-dialog/configure-rating-dialog.component';
import {ChooseCountryComponent} from './dialogs/choose-country-dialog/choose-country.component';
import {RatingsTemplateComponent} from './ratings-template/ratings-template.component';
import {RatingsStarsComponent} from './ratings-stars/ratings-stars.component';

@NgModule({
  imports: [
    SharedModule,
    RATINGS_ROUTING
  ],
  declarations: [
    RatingsComponent,
    RatingsTemplateComponent,
    DeleteTemplateDialogComponent,
    ConfigureRatingDialogComponent,
    ChooseCountryComponent,
    RatingsStarsComponent
  ],
  entryComponents: [
    DeleteTemplateDialogComponent,
    ConfigureRatingDialogComponent,
    ChooseCountryComponent,
    RatingsTemplateComponent,
    RatingsStarsComponent
  ]
})
export class RatingsModule {
}
