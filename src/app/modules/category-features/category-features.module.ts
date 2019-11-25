import { NgModule } from '@angular/core';
import { CATEGORY_FEATURES_ROUTING } from './category-features-routing';
import { CategoryFeaturesComponent } from './category-features.component';
import { SharedModule } from '@b2b/shared/shared.module';
import { SeoConfigDialogComponent } from './components/category-features-item/seo-config-dialog/seo-config-dialog.component';

@NgModule({
  imports: [
    SharedModule,
    CATEGORY_FEATURES_ROUTING
  ],
  exports: [
  ],
  declarations: [
    CategoryFeaturesComponent,
    SeoConfigDialogComponent
  ],
  entryComponents: [
    SeoConfigDialogComponent
  ]
})
export class CategoryFeaturesModule {
}
