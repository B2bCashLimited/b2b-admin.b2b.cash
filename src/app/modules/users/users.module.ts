import {NgModule} from '@angular/core';
import {USERS_ROUTING} from './users-routing';
import {UsersComponent} from './users.component';
import {SharedModule} from '@b2b/shared/shared.module';
import {UsersService} from './users.service';

@NgModule({
  imports: [
    SharedModule,
    USERS_ROUTING
  ],
  declarations: [
    UsersComponent
  ],
  providers: [
    UsersService
  ]
})
export class UsersModule {
}
