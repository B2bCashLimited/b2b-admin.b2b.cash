import {Injectable} from '@angular/core';
import * as io from 'socket.io-client';
import {ConfigService} from '@b2b/services/config.service';
import {SelectedActivity} from './models';

@Injectable()
export class SocketOldService {

  readonly SOCKET_EVENTS_CHAT = {
    newMessage: 'new message',
    relationActivity: 'relation activity',
    online: 'online',
    offline: 'offline',
    chatUpdate: 'chat update',
    connect: 'connect',
    disconnect: 'disconnect',
    status: 'status',
    chatActivity: 'chat activity',
    chatCreate: 'chat create',
    message: 'message',
    consultantRated: 'consultant_rated',
    clientRatedYou: 'client_rated_you',
    clientOpenWindow: 'client_open_window',
    clientOpenedWindow: 'client_opened_window',
    clientCloseWindow: 'client_close_window',
    clientClosedWindow: 'client_closed_window',
    clientCloseQuestion: 'client_close_question',
    clientClosedQuestion: 'client_closed_question',
    clientDisconnect: 'client_disconnect',
    clientDisconnected: 'client_disconnected',
    clientConnect: 'client_connect',
    clientConnected: 'client_connected',
    chatClosedByTO: 'chat_closed_by_timeout',
  };

  readonly SOCKET_EVENTS_APP = {
    user_status_updated: 'user_status_updated',
    PRODUCT_STATUS_UPDATE: 'product_status_update',
    NOT_MODERATED_PRODUCTS: 'not_moderated_products',
    MODERATOR_PRODUCT_SUBSCRIBE: 'moderator_product_subscribe',
    MODERATOR_PRODUCT_UNSUBSCRIBE: 'moderator_product_unsubscribe',
  };
  readonly EVENTS = this.SOCKET_EVENTS_CHAT;

  private _socket;
  private _connected = false;
  private _currentUserId: number;

  constructor(private _config: ConfigService) {
  }

  connect(userId: number): void {
    console.log('S2 connect', this._socket, userId);
    if (this._currentUserId !== userId && this._socket) {
      console.log('S2 full reconnect', this._socket, userId);
      this.disconnect(true);
      this._socket = io.connect(`${this._config.chatUrl}?id=${userId}`, { secure: true, transports: ['websocket'] });
      this._currentUserId = userId;
      this._connected = true;
    } else if (!this._socket) {
      console.log('S2 new connect', this._socket, userId);
      this._socket = io.connect(`${this._config.chatUrl}?id=${userId}`, { secure: true, transports: ['websocket'] });
      this._currentUserId = userId;
      this._connected = true;
    } else if (this._socket || this._connected) {
      console.log('S2 fake connect', this._socket, userId);
      this._connected = true;
    }
  }

  disconnect(fullDisconnect = false): void {
    console.log('S2 disconnect');
    if (fullDisconnect) {
      console.log('S2 full disconnect');
      this._socket.disconnect();
      this._socket = null;
    } else if (this._socket.connected || this._connected) {
      console.log('S2 fake disconnect');
      this._connected = false;
    }
  }

  on(event: string, callback): void {
    // console.log(`S2 On ${event}`);
    if (this._connected) {
      this._socket.on(event, callback);
    }
  }

  turnOff(event: string): void {
    console.log(`S2 Off ${event}`);
    this._socket.off(event);
  }

  emit(event: string, data?: any): void {
    if (this._socket.connected || this._connected) {
      console.log(`S2 Emit2 ${event}`);
      this._socket.emit(event, data);
    } else {
      console.log(`S2 Emit3 ${event}`);
      this.connect(this._currentUserId);
      this.emit(event, data);   // setTimeout?
    }
  }

  // to remove events
  off(event: string): void {
    console.log(`S2 Off ${event}`);
    this._socket.off(event);
  }

  offAllChat() {
    Object.keys(this.SOCKET_EVENTS_CHAT).map(value => this._socket.off(this.SOCKET_EVENTS_CHAT[value]));
  }

  onNewMessage(callback): void {
    this.on(this.SOCKET_EVENTS_CHAT.newMessage, callback);
  }

  onRelationActivity(callback): void {
    this.on(this.SOCKET_EVENTS_CHAT.relationActivity, callback);
  }

  onOnline(callback): void {
    this.on(this.SOCKET_EVENTS_CHAT.online, callback);
  }

  onOffline(callback): void {
    this.on(this.SOCKET_EVENTS_CHAT.offline, callback);
  }

  onChatUpdate(callback): void {
    this.on(this.SOCKET_EVENTS_CHAT.chatUpdate, callback);
  }

  onConnect(callback): void {
    this.on(this.SOCKET_EVENTS_CHAT.connect, callback);
  }

  onDisconnect(callback): void {
    this.on(this.SOCKET_EVENTS_CHAT.disconnect, callback);
  }

  onClientRatedYou(callback): void {
    this.on(this.SOCKET_EVENTS_CHAT.clientRatedYou, callback);
  }

  onClientOpenedWindow(callback): void {
    this.on(this.SOCKET_EVENTS_CHAT.clientOpenedWindow, callback);
  }

  onClientClosedWindow(callback): void {
    this.on(this.SOCKET_EVENTS_CHAT.clientClosedWindow, callback);
  }

  onClientClosedQuestion(callback): void {
    this.on(this.SOCKET_EVENTS_CHAT.clientClosedQuestion, callback);
  }

  onClientDisconnected(callback): void {
    this.on(this.SOCKET_EVENTS_CHAT.clientDisconnected, callback);
  }

  onClientConnected(callback): void {
    this.on(this.SOCKET_EVENTS_CHAT.clientConnected, callback);
  }

  onUserStatusUpdated(callback): void {
    this.on(this.SOCKET_EVENTS_APP.user_status_updated, callback);
  }

  onChatClosedByTO(callback): void {
    this.on(this.SOCKET_EVENTS_CHAT.chatClosedByTO, callback);
  }

  emitStatus(data: {
    chat_id: number,
    id: number,
    status: number,
    activities: any
  }): void {
    this.emit(this.SOCKET_EVENTS_CHAT.status, data);
  }

  emitChatActivity(data: {
    chat_id: number,
    activities: any
  }): void {
    this.emit(this.SOCKET_EVENTS_CHAT.chatActivity, data);
  }

  emitChatCreate(data: {
    chat_id: number,
    activities: any
  }): void {
    this.emit(this.SOCKET_EVENTS_CHAT.chatCreate, data);
  }

  emitMessage(data: {
    chat_id: number,
    text: string,
    activities: SelectedActivity,
    type?: string,
    attributes?: string
  }): void {
    this.emit(this.SOCKET_EVENTS_CHAT.message, data);
  }

  emitConsultantRated(data: {
    chat_id: number,    // идентификатор чата
    rate: number        // оценка
  }) {
    this.emit(this.SOCKET_EVENTS_CHAT.consultantRated, data);
  }

  emitClientOpenWindow(data: {
    chat_id: number     // идентификатор чата
  }) {
    this.emit(this.SOCKET_EVENTS_CHAT.clientOpenWindow, data);
  }

  emitClientCloseWindow(data: {
    chat_id: number     // идентификатор чата
  }) {
    this.emit(this.SOCKET_EVENTS_CHAT.clientCloseWindow, data);
  }

  emitClientCloseQuestion(data: {
    chat_id: number     // идентификатор чата
  }) {
    this.emit(this.SOCKET_EVENTS_CHAT.clientCloseQuestion, data);
  }

  emitClientDisconnect(data: {
    chat_id: number     // идентификатор чата
  }) {
    this.emit(this.SOCKET_EVENTS_CHAT.clientDisconnect, data);
  }

  emitClientConnected(data: {
    chat_id: number     // идентификатор чата
  }) {
    this.emit(this.SOCKET_EVENTS_CHAT.clientConnected, data);
  }
}
