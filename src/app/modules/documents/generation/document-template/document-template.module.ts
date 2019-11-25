import { NgModule } from '@angular/core';
import { SharedModule } from '@b2b/shared/shared.module';
import { DocumentTemplateRouting } from './document-template-routing';
import { DocumentTemplateComponent } from './document-template.component';
import { ActInvoiceTemplateComponent } from './act-invoice-template/act-invoice-template.component';
import {
  NoRequisitesComponent
} from '../dialogs/no-requisites/no-requisites.component';
import { SelectRequisiteComponent } from './components/select-requisite/select-requisite.component';

@NgModule({
  imports: [
    SharedModule,
    DocumentTemplateRouting,
  ],
  declarations: [
    DocumentTemplateComponent,
    ActInvoiceTemplateComponent,
    NoRequisitesComponent,
    SelectRequisiteComponent
  ],
  entryComponents: [NoRequisitesComponent]
})
export class DocumentTemplateModule {
}
