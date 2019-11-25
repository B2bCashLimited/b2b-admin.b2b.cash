import {NgModule} from '@angular/core';
import {RolesRouting} from './roles-routing';
import {RolesComponent} from './roles.component';
import {SharedModule} from '@b2b/shared/shared.module';
import {RoleResolver} from './role.resolver';
import {WorkingScheduleModule} from '@b2b/components/working-schedule/working-schedule.module';

@NgModule({
  imports: [
    SharedModule,
    RolesRouting,
    WorkingScheduleModule
  ],
  declarations: [
    RolesComponent,
  ],
  providers: [
    RoleResolver
  ]
})
export class RolesModule {
}
