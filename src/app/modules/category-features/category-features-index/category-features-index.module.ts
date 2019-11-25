import {NgModule} from '@angular/core';
import {CATEGORY_FEATURES_INDEX_ROUTING} from './category-features-index-routing';
import {CategoryFeaturesIndexComponent} from './category-features-index.component';
import {SharedModule} from '@b2b/shared/shared.module';
import {CategoryFeaturesItemComponent} from '../components/category-features-item/category-features-item.component';

@NgModule({
  imports: [
    SharedModule,
    CATEGORY_FEATURES_INDEX_ROUTING
  ],
  exports: [
    CategoryFeaturesItemComponent
  ],
  declarations: [
    CategoryFeaturesIndexComponent,
    CategoryFeaturesItemComponent
  ]
})
export class CategoryFeaturesIndexModule {
}
