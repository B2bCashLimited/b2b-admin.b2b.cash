import { NgModule } from '@angular/core';
import { SharedModule } from '@b2b/shared/shared.module';
import { GenerationRouting } from './generation-routing';
import { GenerationComponent } from './generation.component';
import { ConfirmDeleteComponent } from './dialogs/confirm-delete/confirm-delete.component';

@NgModule({
  imports: [
    SharedModule,
    GenerationRouting
  ],
  declarations: [
    GenerationComponent,
    ConfirmDeleteComponent,
  ],
  entryComponents: [ConfirmDeleteComponent]
})
export class GenerationModule {
}
