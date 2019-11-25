import { NgModule } from '@angular/core';
import { SharedModule } from '@b2b/shared/shared.module';
import { ProductsXlsComponent } from './products-xls.component';
import { PRODUCTS_XLS_ROUTING } from './products-xls.routing';
import { TaskDialogComponent } from './task-dialog/task-dialog.component';
import { XlsFileUploadDialogComponent } from './xls-file-upload-dialog/xls-file-upload-dialog.component';
import { SetSchemeDialogComponent } from './set-scheme-dialog/set-scheme-dialog.component';
import { SchemeWarningDialogComponent } from './set-scheme-dialog/scheme-warning-dialog/scheme-warning-dialog.component';
import { ParsedProductDialogComponent } from './parsed-product-dialog/parsed-product-dialog.component';
import { SchemeTabExtPropComponent } from './set-scheme-dialog/scheme-tab-ext-prop/scheme-tab-ext-prop.component';
import { SchemeTabPropComponent } from './set-scheme-dialog/scheme-tab-prop/scheme-tab-prop.component';
import { SchemeTabDictionaryComponent } from './set-scheme-dialog/scheme-tab-dictionary/scheme-tab-dictionary.component';

@NgModule({
  imports: [
    SharedModule,
    PRODUCTS_XLS_ROUTING,
  ],
  declarations: [
    ProductsXlsComponent,
    ParsedProductDialogComponent,
    SetSchemeDialogComponent,
    SchemeWarningDialogComponent,
    SchemeTabPropComponent,
    SchemeTabDictionaryComponent,
    SchemeTabExtPropComponent,
    TaskDialogComponent,
    XlsFileUploadDialogComponent
  ],
  exports: [],
  entryComponents: [
    SchemeWarningDialogComponent,
    ParsedProductDialogComponent,
    SetSchemeDialogComponent,
    TaskDialogComponent,
    XlsFileUploadDialogComponent
  ],
  providers: []
})
export class ProductsXlsModule { }
