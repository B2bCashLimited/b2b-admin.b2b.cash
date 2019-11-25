import { NgModule } from '@angular/core';
import { CATEGORY_FEATURES_ADD_ROUTING } from './category-features-add-routing';
import { CategoryFeaturesAddComponent } from './category-features-add.component';
import { SharedModule } from '@b2b/shared/shared.module';
import {
  FormulaDialogComponent, PropertyPipe,
  ConfirmDeleteComponent,
  CategoryBusinessPropertyDialogComponent
} from './dialogs';

@NgModule({
  imports: [
    SharedModule,
    CATEGORY_FEATURES_ADD_ROUTING
  ],
  declarations: [
    FormulaDialogComponent,
    CategoryFeaturesAddComponent,
    CategoryBusinessPropertyDialogComponent,
    ConfirmDeleteComponent,
    PropertyPipe,
  ],
  entryComponents: [
    ConfirmDeleteComponent,
    FormulaDialogComponent,
    CategoryBusinessPropertyDialogComponent
  ]
})
export class CategoryFeaturesAddModule {
}
