import { NgModule } from '@angular/core';
import { UPDATE_ORDER_ROUTING } from './update-order-routing';
import { UpdateOrderComponent } from './update-order.component';
import { SharedModule } from '@b2b/shared/shared.module';
import { ProductItemComponent } from './product-item/product-item.component';
import { ProductCategoryItemComponent } from './product-item/product-category-item/product-category-item.component';

@NgModule({
  imports: [
    SharedModule,
    UPDATE_ORDER_ROUTING
  ],
  declarations: [
    UpdateOrderComponent,
    ProductItemComponent,
    ProductCategoryItemComponent
  ]
})
export class UpdateOrderModule { }
