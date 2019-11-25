import { NgModule } from '@angular/core';
import { ACTIVITIES_INDEX_ROUTING } from './activities-index-routing';
import { ActivitiesIndexComponent } from './activities-index.component';
import { SharedModule } from '@b2b/shared/shared.module';
import { SetBonusDialogComponent } from './dialogs/set-bonus-dialog/set-bonus-dialog.component';

@NgModule({
  imports: [
    SharedModule,
    ACTIVITIES_INDEX_ROUTING
  ],
  declarations: [
    ActivitiesIndexComponent,
    SetBonusDialogComponent
  ],
  entryComponents: [SetBonusDialogComponent]
})
export class ActivitiesIndexModule {
}
