import {NgModule} from '@angular/core';
import {SIGNIN_ROUTING} from './signin-routing';
import {SigninComponent} from './signin.component';
import {SharedModule} from '@b2b/shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    SIGNIN_ROUTING
  ],
  declarations: [
    SigninComponent
  ]
})
export class SigninModule {
}
