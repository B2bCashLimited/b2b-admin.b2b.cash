import { NgModule } from '@angular/core';
import { SharedModule } from '@b2b/shared/shared.module';
import { ListMarketIndexComponent } from './list-market-index.component';
import { LIST_MARKETPLACE_INDEX_ROUTING } from './list-market-index-routing';
import { ListMarketItemComponent } from './list-market-item/list-market-item.component';
import { ListMarketCategoriesComponent } from './list-market-categories/list-market-categories.component';
import { CategoryIconEditDialogComponent } from './popups/category-icon-edit-dialog/category-icon-edit-dialog.component';

@NgModule({
  imports: [
    SharedModule,
    LIST_MARKETPLACE_INDEX_ROUTING
  ],
  declarations: [
    ListMarketIndexComponent,
    ListMarketItemComponent,
    ListMarketCategoriesComponent,
    CategoryIconEditDialogComponent,
  ],
  entryComponents: [
    CategoryIconEditDialogComponent,
  ],
})
export class ListMarketplaceIndexModule {
}
