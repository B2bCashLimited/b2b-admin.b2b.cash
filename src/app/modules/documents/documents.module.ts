import { NgModule } from '@angular/core';
import { DocumentsComponent } from './documents.component';
import { SharedModule } from '@b2b/shared/shared.module';
import { DocumentsRouting } from './documents-routing';

@NgModule({
  imports: [
    SharedModule,
    DocumentsRouting
  ],
  declarations: [DocumentsComponent],
})
export class DocumentsModule {
}
