import { NgModule } from '@angular/core';
import { PRODUCTS_ROUTING } from './products-routing';
import { ProductsComponent } from './products.component';
import { SharedModule } from '@b2b/shared/shared.module';
import { ActivityChipComponent } from './activity-modal/activity-chip/activity-chip.component';
import { ActivityItemComponent } from './activity-modal/activity-item/activity-item.component';
import { ActivitiesListComponent } from './activity-modal/activities-list/activities-list.component';
import { ActivitiesModalComponent } from './activity-modal/activities-modal/activities-modal.component';
import { ModerateModePopoverComponent } from './moderate-mode-popover/moderate-mode-popover.component';
import { ImagesViewerComponent } from './images-viewer/images-viewer.component';
import { PropertiesDialogComponent } from './properties-dialog/properties-dialog.component';
import { WindowsListService } from './windows-list.service';
import { HttpService } from './http.service';
import { AccessDeniedComponent } from './access-denied/access-denied.component';
import { UnmoderatedCategoriesListComponent } from './unmoderated-categories-list/unmoderated-categories-list.component';
import { ModerateDialogComponent } from './unmoderated-categories-list/moderate-dialog/moderate-dialog.component';
import { CreateCategoryDialogComponent } from './unmoderated-categories-list/create-category-dialog/create-category-dialog.component';
import { UnmoderatedPropertiesListComponent } from './unmoderated-properties-list/unmoderated-properties-list.component';
import { ModeratePropertyDialogComponent } from './unmoderated-properties-list/moderate-property-dialog/moderate-property-dialog.component';
// tslint:disable-next-line:max-line-length
import { OverritePropertyDialogComponent } from './unmoderated-properties-list/moderate-property-dialog/overrite-property-dialog/overrite-property-dialog.component';
// tslint:disable-next-line:max-line-length
import { NewPropertyDialogComponent } from './unmoderated-properties-list/moderate-property-dialog/new-property-dialog/new-property-dialog.component';
import { ModerateProducsNamesComponent } from './moderate-producs-names/moderate-producs-names.component';
import { UnmoderatedPropertiesValueListComponent } from './unmoderated-properties-value-list/unmoderated-properties-value-list.component';
import { ModerateValueDialogComponent } from './unmoderated-properties-value-list/moderate-value-dialog/moderate-value-dialog.component';
// tslint:disable-next-line:max-line-length
import { AddValueDialogComponent } from './unmoderated-properties-value-list/moderate-value-dialog/add-value-dialog/add-value-dialog.component';

@NgModule({
  imports: [
    SharedModule,
    PRODUCTS_ROUTING,
  ],
  declarations: [
    AccessDeniedComponent,
    ActivitiesListComponent,
    ActivitiesModalComponent,
    ActivityChipComponent,
    ActivityItemComponent,
    CreateCategoryDialogComponent,
    ImagesViewerComponent,
    ModerateDialogComponent,
    ModerateModePopoverComponent,
    ModeratePropertyDialogComponent,
    ProductsComponent,
    PropertiesDialogComponent,
    UnmoderatedCategoriesListComponent,
    UnmoderatedPropertiesListComponent,
    OverritePropertyDialogComponent,
    NewPropertyDialogComponent,
    ModerateProducsNamesComponent,
    UnmoderatedPropertiesValueListComponent,
    ModerateValueDialogComponent,
    AddValueDialogComponent,
  ],
  exports: [
    AccessDeniedComponent,
  ],
  entryComponents: [
    ActivitiesModalComponent,
    CreateCategoryDialogComponent,
    ModerateDialogComponent,
    ModeratePropertyDialogComponent,
    PropertiesDialogComponent,
    OverritePropertyDialogComponent,
    NewPropertyDialogComponent,
    ModerateValueDialogComponent,
    AddValueDialogComponent,
  ],
  providers: [
    HttpService,
    WindowsListService,
  ]
})
export class ProductsModule {
}
