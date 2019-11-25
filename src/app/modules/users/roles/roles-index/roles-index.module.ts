import {NgModule} from '@angular/core';
import {ROLES_INDEX_ROUTING} from './roles-index-routing';
import {RolesIndexComponent} from './roles-index.component';
import {SharedModule} from '@b2b/shared/shared.module';
import {DeleteRoleDialogComponent} from '../dialogs/delete-role-dialog/delete-role-dialog.component';

@NgModule({
  imports: [
    SharedModule,
    ROLES_INDEX_ROUTING
  ],
  declarations: [
    RolesIndexComponent,
    DeleteRoleDialogComponent
  ],
  entryComponents: [
    DeleteRoleDialogComponent
  ]
})
export class RolesIndexModule {
}
