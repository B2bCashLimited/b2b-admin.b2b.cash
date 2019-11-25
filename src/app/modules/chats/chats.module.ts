import {NgModule} from '@angular/core';
import {CHATS_ROUTING} from './chats-routing';
import {ChatsComponent} from './chats.component';
import {ChatService} from './chat.service';
import {SharedModule} from '@b2b/shared/shared.module';
import {UploadService} from './upload.service';
import {SocketOldService} from './socket.service';

@NgModule({
  imports: [
    SharedModule,
    CHATS_ROUTING
  ],
  declarations: [
    ChatsComponent
  ],
  providers: [
    ChatService,
    UploadService,
    SocketOldService
  ]
})
export class ChatsModule {
}
