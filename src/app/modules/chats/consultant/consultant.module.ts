import {NgModule} from '@angular/core';
import {CONSULTANT_ROUTING} from './consultant-routing';
import {ConsultantComponent} from './consultant.component';
import {SharedModule} from '@b2b/shared/shared.module';
import {ChatContactsComponent} from './contacts/contacts.component';
import {ChatWindowComponent} from './window/window.component';
import {ChatFocusDirective} from './window/window.directive';
import {FileUploadModule} from 'ng2-file-upload';
import {AccessDeniedComponent} from './access-denied/access-denied.component';
import {CloseChatDialogComponent} from '../popups/close-chat-dialog/close-chat-dialog.component';
import {BanClientDialogComponent} from '../popups/ban-client-dialog/ban-client-dialog.component';

@NgModule({
  imports: [
    SharedModule,
    FileUploadModule,
    CONSULTANT_ROUTING
  ],
  declarations: [
    ConsultantComponent,
    AccessDeniedComponent,
    ChatContactsComponent,
    ChatWindowComponent,
    ChatFocusDirective,
    CloseChatDialogComponent,
    BanClientDialogComponent,
  ],
  exports: [
    AccessDeniedComponent,
    ChatContactsComponent,
    ChatWindowComponent,
    ChatFocusDirective,
  ],
  entryComponents: [
    BanClientDialogComponent,
    CloseChatDialogComponent,
  ]
})
export class ConsultantModule {
}
