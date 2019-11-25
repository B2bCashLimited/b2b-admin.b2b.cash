import {NgModule} from '@angular/core';
import {ProductCategoriesRoutingModule} from './product-categories-routing.module';
import {ProductCategoriesWrapComponent} from './product-categories-wrap.component';
import {SharedModule} from '@b2b/shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    ProductCategoriesRoutingModule
  ],
  declarations: [
    ProductCategoriesWrapComponent,
  ],
  entryComponents: [
  ],
  exports: [
  ]
})
export class ProductCategoriesModule {
}
