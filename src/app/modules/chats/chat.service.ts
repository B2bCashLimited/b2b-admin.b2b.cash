import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {UserService} from '@b2b/services/user.service';
import {ConfigService} from '@b2b/services/config.service';
import {map} from 'rxjs/operators';
import {ChatGetResponse, ChatMessageTypes, SelectedActivity} from './models';
import {User} from '../moderation/products/models/user.model';
import {SocketOldService} from './socket.service';

@Injectable()
export class ChatService {
  user: User;
  contactsLimit = 10;
  messagesLimit = 20;
  currentChatId = new Subject<any>();
  currentChatLogo: string;
  contacts = new Subject<any>();         // замена для всех обновлений контактов
  read = new Subject<any>();           // Виндоу меняет стили в зав-ти от этого (видимо прочит - непрочит сообщения)
  destroy = new Subject<any>();          // уничтожение окна чата - подписка в Виндоу, много некстов
  newMessage = new Subject<any>();         // 1 некст тут и 1 подписка в виндоу
  stop = new Subject<any>();         // подписка в чатКОмпонент, 2 тут в компонентДидЛоад
  hide = new Subject<any>();          // чатКомпонент онДестрой (тру), Виджет онДестрой (тру)
  step$ = new BehaviorSubject(1);    // 2 подписки и 1 next тут :732 (3 исп) - переходы в мобил режим
  consultantIsInWork = new BehaviorSubject(false);
  clientOnline = new Subject<boolean>();
  chatAutoclosed = new Subject<any>();

  constructor(private _http: HttpClient,
              private userService: UserService,
              private config: ConfigService,
              private socket: SocketOldService) {
  }

  getHistory(chat_id, page) {
    return this._http.get(`${this.config.chatUrl}/chat/${chat_id}/messages?page=${page}&per_page=${this.messagesLimit}`)
      .pipe(map(value => value['data']));
  }

  getContacts(search: { text: string, select: number }, page = 1, limit = this.contactsLimit): Observable<ChatGetResponse> {
    const url_params: any = {
      userId: +this.user.id || 0,
      type: 1,
      search: search.text,
      closed: search.select,
      page: page,
      limit: limit
    };
    return this._http.get<ChatGetResponse>(`${this.config.apiUrl}/chat-get`, {params: url_params});
  }

  send(chat_id: number, text: string, type: string = ChatMessageTypes.TYPE_USER, attributes?: string) {
    this.socket.emitMessage({
      chat_id: chat_id,
      text: text,
      activities: this.transistCA(),
      type: type || null,
      attributes: attributes || null
    });
    this.socket.emitChatActivity({chat_id: chat_id, activities: this.transistCA()});
  }

  banChatRelation(clientId: number): Observable<any> { // <!-- id из chat relation -->
    return this._http.post(`${this.config.apiUrl}/ban-chat-relation`, {id: clientId});
  }

  /* selectActivity(data: SelectedActivity): void {
     this.activityChanged.next(data);
     this.destroyWindow();
   }*/

  componentDidLoad(user: User): void {
    this.user = user;
    this.socket.onNewMessage(socket => {
      this.newMessage.next(socket);
    });
    this.socket.onRelationActivity(socket => {
      this.read.next(socket);
    });
    this.socket.onOnline(socket => {
      // this.activity.next({type: 1, user_id: socket.user_id});
    });
    this.socket.onOffline(socket => {
      // this.activity.next({type: 2, user_id: socket.user_id});
    });
    this.socket.onChatUpdate(data => {
      const transist = this.transistCA();
      const companyId = transist['companyId'] ? transist['companyId'] : 0;
      const activityKey = transist['activityKey'] ? transist['activityKey'] : '';
      const activityId = transist['activityId'] ? transist['activityId'] : 0;
      if (activityId) {
        if (+data.company_id === +companyId &&
          data.activityKey === activityKey &&
          +data.activityId === +activityId
        ) {
          this.contactsUpdate(data);
        }
      } else {
        if (+data.company_id === +companyId) {
          this.contactsUpdate(data);
        }
      }
    });
    this.socket.onConnect(data => {
      this.stop.next(2);
    });

    this.socket.onDisconnect(data => {
      if (!this.hide) {
        this.stop.next(1);
      }
    });
    this.socket.onClientConnected(data => {
      // this.contactsUpdate(data);
      this.clientOnline.next(true);
    });
    this.socket.onClientDisconnected(data => {
      // this.contactsUpdate(data);
      this.clientOnline.next(false);
    });
    this.socket.onChatClosedByTO(data => {
      // this.contactsUpdate(data);
      // this.contactsUpdate(data);
      this.chatAutoclosed.next(1);
    });
    /*this.socket.onChatAutoclosed(data => {        // когда будет апи
      this.chatAutoclosed.next(1);
    });*/
    /*this.socket.onClientOpenedWindow(data => {
      this.clientSwitchedWindow.next(true);
      // this.contactsUpdate(data);
    });*/
    /*this.socket.onClientClosedWindow(data => {
      this.clientSwitchedWindow.next(false);
      // this.contactsUpdate(data);
    });
    this.socket.onClientClosedQuestion(data => {
      // this.contactsUpdate(data);
    });
    this.socket.onClientRatedYou(data => {
      // this.contactsUpdate(data);
    });*/
  }

  countUnread(id, chat_id, status = 3): void {
    this.socket.emitStatus({chat_id: chat_id, id: id, status: status, activities: this.transistCA()});
  }

  focusChat(chat_id: number): void {
    this.socket.emitChatActivity({chat_id: chat_id, activities: this.transistCA()});
  }

  transistCA(): SelectedActivity {
    /*const obj = getFromLocalStorage('B2B_ACTIVITY_SELECT');
    const owner = getFromLocalStorage('chat') ? getFromLocalStorage('chat')['owner'] : 1;*/
    const res: SelectedActivity = {
      companyId: 0,
      activityKey: '',
      activityId: 0
    };
    /*if (obj && owner === 2) {
      const companyId = +obj.activeCompany.id;
      const activityKey = obj.activity.keyName;
      const activityId = obj.activityName.id;
      res = {
        companyId: companyId,
        activityKey: activityKey,
        activityId: activityId
      };
    }*/
    return res;
  }

  getChat(chatId): Observable<any> {
    return this._http.get(`${this.config.apiUrl}/chat/${chatId}`);
  }

  getMessages(chatId): Observable<any> {
    return this._http.get(`${this.config.chatUrl}/chat/${chatId}/messages?page=1&per_page=${this.messagesLimit}`);
  }

  openChat(chatId: number): void {
    this.setMobileDependency(2);
    this.socket.emitChatActivity({chat_id: chatId, activities: this.transistCA()});
    this.currentChatId.next(chatId);
  }

  closeSysChat(chatId: number) {
    return this._http.put(`${this.config.apiUrl}/chat/${chatId}`, {closed: true}).pipe(map(value => {
      this.contactsUpdate();
      return value;
    }));
  }

  getConsultantStat(to = ''): Observable<any> {
    const params = {
      userId: this.user.id.toString() || '0',
      to: to
    };
    return this._http.get(`${this.config.apiUrl}/consultant-stat`, {params: params});
  }

  startConsultant(): Observable<any> {
    const body = {
      pause: 0
    };
    return this._http.post(`${this.config.apiUrl}/pause-consultant`, body);
  }

  pauseConsultant(): Observable<any> {
    const body = {
      pause: 1
    };
    return this._http.post(`${this.config.apiUrl}/pause-consultant`, body);
  }

  getConsultantsList(from?, to?): Observable<any> {
    const params = {};
    if (from) {
      params['from'] = from;
    }
    if (to) {
      params['to'] = to;
    }
    return this._http.get(`${this.config.apiUrl}/consultants`, {params: params});
  }

  deleteChat(chatId): Observable<any> {
    const body = {
      deleted: 1
    };
    return this._http.put(`${this.config.apiUrl}/chat/${chatId}`, body);
  }

  getSettings(): Observable<any> {
    return this._http.get(`${this.config.apiUrl}/settings?limit=100`);
  }

  setSettingsParam(name: string, value: string = ''): Observable<any> {
    const body = {
      name: name,
      value: value
    };
    return this._http.post(`${this.config.apiUrl}/set-param`, body);
  }

  destroyWindow() {                       // 7 использований
    this.destroy.next(true);        // 1 подписка в window.component
  }

  contactsUpdate(newContacts?: any): void {                      // из group-chat в контактс (1 подписка)
    this.contacts.next(newContacts ? newContacts : null);
  }

  disconnect() {                        // онДестрой в ЧатКомп и Виджет
    this.socket.offAllChat();
    this.socket.disconnect();
  }

  setMobileDependency(step) {
    this.step$.next(step);
  }
}
