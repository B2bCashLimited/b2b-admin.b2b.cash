import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@b2b/shared/shared.module';
import { ActInvoiceTemplateRouting } from './act-invoice-template-routing';
import { ActInvoiceTemplateComponent } from './act-invoice-template.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ActInvoiceTemplateRouting,
  ],
  declarations: [ActInvoiceTemplateComponent],
})
export class ActInvoiceTemplateModule {
}
