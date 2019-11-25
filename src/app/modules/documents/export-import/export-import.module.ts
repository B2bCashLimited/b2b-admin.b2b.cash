import { NgModule } from '@angular/core';
import { SharedModule } from '@b2b/shared/shared.module';
import { ExportImportRouting } from './export-import-routing';
import { ExportImportComponent } from './export-import.component';
import { SuccessSaveDateComponent } from './dialogs/success-save-date/success-save-date.component';

@NgModule({
  imports: [
    SharedModule,
    ExportImportRouting
  ],
  declarations: [
    ExportImportComponent,
    SuccessSaveDateComponent
  ],
  entryComponents: [SuccessSaveDateComponent]
})
export class ExportImportModule {
}
