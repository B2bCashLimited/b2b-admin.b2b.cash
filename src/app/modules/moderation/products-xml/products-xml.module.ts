import { NgModule } from '@angular/core';
import { SharedModule } from '@b2b/shared/shared.module';
import { ProductsXmlComponent } from './products-xml.component';
import { PRODUCTS_XML_ROUTING } from './products-xml.routing';
import { TaskDialogComponent } from './task-dialog/task-dialog.component';
import { GeneratePreviewDialogComponent } from './generate-preview-dialog/generate-preview-dialog.component';
import { SetSchemeDialogComponent } from './set-scheme-dialog/set-scheme-dialog.component';
import { ParsedProductDialogComponent } from './parsed-product-dialog/parsed-product-dialog.component';
import { SchemeTabExtPropComponent } from './set-scheme-dialog/scheme-tab-ext-prop/scheme-tab-ext-prop.component';
import { SchemeTabPropComponent } from './set-scheme-dialog/scheme-tab-prop/scheme-tab-prop.component';
import { SchemeTabDictionaryComponent } from './set-scheme-dialog/scheme-tab-dictionary/scheme-tab-dictionary.component';

@NgModule({
  imports: [
    SharedModule,
    PRODUCTS_XML_ROUTING,
  ],
  declarations: [
    ProductsXmlComponent,
    ParsedProductDialogComponent,
    GeneratePreviewDialogComponent,
    SetSchemeDialogComponent,
    SchemeTabPropComponent,
    SchemeTabDictionaryComponent,
    SchemeTabExtPropComponent,
    TaskDialogComponent
  ],
  exports: [],
  entryComponents: [
    ParsedProductDialogComponent,
    GeneratePreviewDialogComponent,
    SetSchemeDialogComponent,
    TaskDialogComponent,
  ],
  providers: []
})
export class ProductsXmlModule { }
