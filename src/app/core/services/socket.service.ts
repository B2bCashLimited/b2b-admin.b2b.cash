import {Injectable} from '@angular/core';
import {ConfigService} from '@b2b/services/config.service';
import {connect} from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private _socket: SocketIOClient.Socket;

  constructor(
    private _config: ConfigService) {
  }

  get connected(): boolean {
    return this._socket && this._socket.connected;
  }

  connectToSocket(userId: number): void {
    if (!this._socket || !this._socket.connected) {
      const options = {secure: true, transports: ['websocket']};
      this._socket = connect(`${this._config.chatUrl}?id=${userId}`, options);
    }
  }

  disconnectFromSocket(): void {
    this._socket.disconnect();
    this._socket = null;
  }

  on(evt: string, callback): void {
    this._socket.on(evt, callback);
  }

  off(evt: string): void {
    this._socket.off(evt);
  }

  emit(event: string, data?: any): void {
    if (this._socket.connected) {
      this._socket.emit(event, data);
    }
  }
}
