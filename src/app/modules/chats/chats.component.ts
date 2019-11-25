import {Component, OnInit} from '@angular/core';
import {SocketOldService} from './socket.service';
import {UserService} from '@b2b/services/user.service';

@Component({
  selector: 'b2b-chats',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.scss']
})
export class ChatsComponent implements OnInit {

  constructor(
    private _socketService: SocketOldService,
    private _userService: UserService) {
    this._socketService.connect(this._userService.currentUser.id);
  }

  ngOnInit() {
  }

}
