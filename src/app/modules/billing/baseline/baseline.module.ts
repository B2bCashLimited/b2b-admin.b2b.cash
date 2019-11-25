import {NgModule} from '@angular/core';
import {BaselineRoutingModule} from './baseline.routing';
import {BaselineComponent} from './baseline.component';
import {PlanSettingsComponent} from './dialogs/plan-settings/plan-settings.component';
import {SharedModule} from '@b2b/shared/shared.module';
import { LocationDialogComponent } from './dialogs/location-dialog/location-dialog.component';

@NgModule({
  declarations: [
    PlanSettingsComponent,
    BaselineComponent,
    LocationDialogComponent,
  ],
  imports: [
    SharedModule,
    BaselineRoutingModule
  ],
  entryComponents: [
    PlanSettingsComponent,
    LocationDialogComponent,
  ]
})
export class BaselineModule {
}
