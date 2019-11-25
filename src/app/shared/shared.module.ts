// Modules
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SelectCountriesComponent } from './components/select-countries/select-countries.component';
import { SelectActivityNamesComponent } from './components/select-activity-names/select-activity-names.component';
import { NgxUploaderModule } from 'ngx-uploader';
import { SelectCategoriesComponent } from './components/select-categories/select-categories.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ControlUnitTypePipe, ModerateStatusPipe, PartnerLogoPipe, ImagePipe, EllipsisPipe } from '@b2b/pipes';
import { NgxPermissionsModule } from 'ngx-permissions';
import { SelectTnvdComponent } from './components/select-tnvd/select-tnvd.component';
import { SelectEtsngComponent } from '@b2b/shared/components/select-etsng/select-etsng.component';
import {
  DateRangeComponent, GlobalErrorDialogComponent, OrderPriceDialogComponent, ConfirmPopupComponent,
  CsvTypeChooseComponent, RegexDialogComponent
} from '@b2b/shared/dialogs';
import { OnlyDigitsInputDirective } from '../core/directives/only-digits-input.directive';
import { CtmCalendarModule } from '@b2b/components/ctm-calendar/ctm-calendar.module';
import { ChoiceOfLanguageModule } from '@b2b/components/choice-of-language/choice-of-language.module';
import { SelectRegionComponent } from '@b2b/shared/components/select-region/select-region.component';
import { SelectCityComponent } from '@b2b/shared/components/select-city/select-city.component';
import { FileUploadModule } from 'ng2-file-upload';
import { SelectCompaniesComponent } from '@b2b/shared/components/select-companies/select-companies.component';
import { SelectActivitiesComponent } from '@b2b/shared/components/select-activities/select-activities.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { OwlDateTimeModule, OwlNativeDateTimeModule, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
import { SelectCurrencyComponent } from './components/select-currency/select-currency.component';
import { ProductCategoriesComponent } from './components/product-categories/product-categories.component';
import { ClipboardModule } from 'ngx-clipboard';
// import { AddCategoryDialogComponent } from './components/product-categories/dialogs/add-category-dialog/add-category-dialog.component';
import { AddCategoryDialogComponent } from './components/product-categories/dialogs/add-category-dialog/add-category-dialog.component';
import { MoveCategoryDialogComponent } from './components/product-categories/dialogs/move-category-dialog/move-category-dialog.component';
import { ConfirmDialogComponent } from './components/product-categories/dialogs/confirm-dialog/confirm-dialog.component';
import { IconEditDialogComponent } from './components/product-categories/dialogs/icon-edit-dialog/icon-edit-dialog.component';
// tslint:disable-next-line:max-line-length
import { TnvedEtsngDescriptionDialogComponent } from './components/product-categories/dialogs/tnved-etsng-description-dialog/tnved-etsng-description-dialog.component';
import { ConfirmDeleteComponent } from './components/product-categories/dialogs/confirm-delete/confirm-delete.component';
import { CategoryFeatureDialogComponent } from './components/category-feature-dialog/category-feature-dialog.component';
import { PropertyOverrideDialogComponent } from './components/property-override-dialog/property-override-dialog.component';
import { PropertyJoinDialogComponent } from './components/property-join-dialog/property-join-dialog.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { RatingStarComponent } from '@b2b/components/rating-star/rating-star.component';
import { AutoCompleteComponent } from './components/auto-complete/auto-complete.component';
import { MATERIAL_MODULES, CityAreaModule, TreeModule } from '@b2b/shared/modules';
import { ReverseArrayPipe } from 'app/core/pipes/reverse-array.pipe';
import { HighlightPipe } from 'app/core/pipes/highlight.pipe';
import {
  ConfirmDeleteTemplateComponent
} from '../modules/mailer/templates/templates-index/dialogs/confirm-delete-template/confirm-delete-template.component';
// tslint:disable-next-line:max-line-length
import { AddCategoryMarketDialogComponent } from './components/add-category-market/add-category-market-dialog/add-category-market-dialog.component';
import { MoreCatetegoryDialogComponent } from './components/more-catetegory-dialog/more-catetegory-dialog.component';

@NgModule({
  imports: [
    ...MATERIAL_MODULES,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgxUploaderModule,
    DragDropModule,
    NgxPermissionsModule,
    CtmCalendarModule,
    ChoiceOfLanguageModule,
    InfiniteScrollModule,
    FileUploadModule,
    ColorPickerModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    ClipboardModule,
    CityAreaModule,
    TreeModule
  ],
  exports: [
    ...MATERIAL_MODULES,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgxUploaderModule,
    DragDropModule,
    NgxPermissionsModule,
    CtmCalendarModule,
    ChoiceOfLanguageModule,
    InfiniteScrollModule,
    FileUploadModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    ColorPickerModule,
    CityAreaModule,
    TreeModule,

    //  Components
    SelectCountriesComponent,
    SelectActivityNamesComponent,
    SelectCategoriesComponent,
    ControlUnitTypePipe,
    SelectTnvdComponent,
    SelectEtsngComponent,
    OnlyDigitsInputDirective,
    ModerateStatusPipe,
    PartnerLogoPipe,
    ImagePipe,
    EllipsisPipe,
    ReverseArrayPipe,
    HighlightPipe,
    DateRangeComponent,
    SelectRegionComponent,
    SelectCityComponent,
    SelectCompaniesComponent,
    SelectActivitiesComponent,
    SelectCurrencyComponent,
    RatingStarComponent,
    AutoCompleteComponent,
    ProductCategoriesComponent,
    AddCategoryDialogComponent,
    AddCategoryMarketDialogComponent,
    MoreCatetegoryDialogComponent,
    MoveCategoryDialogComponent,
    ConfirmDialogComponent,
    IconEditDialogComponent,
    TnvedEtsngDescriptionDialogComponent,
    ConfirmDeleteComponent,
    ClipboardModule,
    OrderPriceDialogComponent,
    RegexDialogComponent,
    CsvTypeChooseComponent,
  ],
  declarations: [
    SelectCountriesComponent,
    SelectActivityNamesComponent,
    SelectCategoriesComponent,
    ControlUnitTypePipe,
    SelectTnvdComponent,
    SelectEtsngComponent,
    GlobalErrorDialogComponent,
    OnlyDigitsInputDirective,
    ModerateStatusPipe,
    PartnerLogoPipe,
    ImagePipe,
    EllipsisPipe,
    ReverseArrayPipe,
    HighlightPipe,
    DateRangeComponent,
    SelectRegionComponent,
    SelectCityComponent,
    SelectCompaniesComponent,
    SelectActivitiesComponent,
    SelectCurrencyComponent,
    RatingStarComponent,
    AutoCompleteComponent,
    AddCategoryMarketDialogComponent,
    ProductCategoriesComponent,
    MoreCatetegoryDialogComponent,
    AddCategoryDialogComponent,
    MoveCategoryDialogComponent,
    ConfirmDialogComponent,
    IconEditDialogComponent,
    TnvedEtsngDescriptionDialogComponent,
    ConfirmDeleteComponent,
    CategoryFeatureDialogComponent,
    PropertyOverrideDialogComponent,
    PropertyJoinDialogComponent,
    OrderPriceDialogComponent,
    RegexDialogComponent,
    ConfirmDeleteTemplateComponent,
    ConfirmPopupComponent,
    MoreCatetegoryDialogComponent,
    CsvTypeChooseComponent,
  ],
  entryComponents: [
    GlobalErrorDialogComponent,
    DateRangeComponent,
    ProductCategoriesComponent,
    AddCategoryDialogComponent,
    MoveCategoryDialogComponent,
    AddCategoryMarketDialogComponent,
    MoreCatetegoryDialogComponent,
    ConfirmDialogComponent,
    IconEditDialogComponent,
    TnvedEtsngDescriptionDialogComponent,
    ConfirmDeleteComponent,
    CategoryFeatureDialogComponent,
    PropertyOverrideDialogComponent,
    PropertyJoinDialogComponent,
    OrderPriceDialogComponent,
    RegexDialogComponent,
    ConfirmDeleteTemplateComponent,
    ConfirmPopupComponent,
    CsvTypeChooseComponent,
  ],
  providers: [
    { provide: OWL_DATE_TIME_LOCALE, useValue: 'ru' },
  ]
})
export class SharedModule {
}
