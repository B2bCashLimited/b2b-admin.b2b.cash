import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import * as moment from 'moment';
import {mergeMap, switchMap} from 'rxjs/operators';
import {of, Subscription} from 'rxjs';
import {ClearSubscriptions} from '@b2b/decorators';
import {Chat, ChatMessageTypes, Message, Relations} from '../../models';
import {ConfigService} from '@b2b/services/config.service';
import {ChatService} from '../../chat.service';
import {CloseChatDialogComponent} from '../../popups/close-chat-dialog/close-chat-dialog.component';
import {BanClientDialogComponent} from '../../popups/ban-client-dialog/ban-client-dialog.component';
import {FileLikeObject, FileUploader} from 'ng2-file-upload';
import {UploadService} from '../../upload.service';

export const allowedImageType = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'jpg',
  'JPG',
  'JPEG',
  'jpeg',
  'png'
];

export const allowedDocType = [
  'doc',
  'docx',
  'pdf',
  'application/pdf',
  'txt',
  'text/plain',
  'xls',
  'rtf',
  'vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-office',
  'application/msword'
];

@Component({
  // tslint:disable-next-line
  selector: 'app-chat-window',
  templateUrl: './window.component.html',
  styleUrls: [
    './window.component.scss'
  ],
})
@ClearSubscriptions()
export class ChatWindowComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('TextArea') TextArea: ElementRef;           // 2 фокуса
  @ViewChild('ListCollection') ListCollection: ElementRef;       // размеры и скролл
  @ViewChild('List') private ListContainer: ElementRef;
  @ViewChild('ToolBar') private ToolBar: ElementRef;
  private stuck = 0;        // запрещение догрузки в опр случаях?
  messages: Message[] = [];
  banned = false;
  bannedTo: string;
  chat: Chat;
  client: Relations;
  clientCompanyName: string;
  clientName: string;
  clientPhoto: string;
  @Input() activities: any[];     // Список автивитисов
  @Output() chatWasClosed = new EventEmitter();
  loaded = {
    messages: -1,
    loading: false
  };
  user: any;
  dimensions = {
    ListContainer: 0,
    ListCollection: 0,
    ToolBar: 0
  };
  textareaValue = '';      // ngModel
  page = 1;
  ownerRelation = 0;         // владелец чата(1), нет(0)?
  totalItems = 0;
  chatType = 1;
  mobile = 0;
  clientOnline: boolean;
  uploader: FileUploader; // = new FileUploader({maxFileSize: 1024 * 1024});
  allowedImageType = allowedImageType;
  allowedDocType = allowedDocType;
  maxFileSize = 1024 * 1024;

  readonly OCCUPATION_CLASS = {
    supplier: 'bb bb-provider',
    manufacturer: 'bb bb-manufactory',
    customsWithoutLicense: 'bb bb-customs',
    customsBroker: 'bb bb-customs-license',
    domesticTrucker: 'bb bb-lorry-country',
    domesticRailCarrier: 'bb bb-rails-country',
    domesticAirCarrier: 'bb bb-plane-country',
    internationalTrucker: 'bb bb-lorry-world',
    internationalRailCarrier: 'bb bb-rails-world',
    seaCarrier: 'bb bb-ship-sea',
    internationalAirCarrier: 'bb bb-plane-world',
    riverCarrier: 'bb bb-ship-river',
    warehouseRent: 'bb bb-warehouse-rent',
    warehouse: 'bb bb-warehouse-security'
  };

  private _curChatSub: Subscription;
  private _csGetChatSub: Subscription;
  private _csGetMessagesSub: Subscription;
  private _csDestroySub: Subscription;
  private _csReadSub: Subscription;
  private _csNewMessageSub: Subscription;
  private _csGetHistorySub: Subscription;
  private _closeChatSub: Subscription;
  private _banClientSub: Subscription;
  private _clientOnlineSub: Subscription;

  constructor(public _config: ConfigService,
              private dialog: MatDialog,
              private chatService: ChatService,
              private elref: ElementRef,
              private ref: ChangeDetectorRef,
              private snackBar: MatSnackBar,
              private _uploadService: UploadService) {
  }

  ngOnInit() {
    this.openCurrentChat();
    this.user = this.chatService.user;

    this._clientOnlineSub = this.chatService.clientOnline.subscribe(value => {    // не исп
      this.clientOnline = value;
    });

    /*this._windowSub = this.windowService.width$.subscribe((value: any) => {
      if (value < 768) {
        this.mobile = 1;
      } else {
        this.mobile = 0;
      }
    });*/

    this.getNewMessages();

    this._csDestroySub = this.chatService.destroy.subscribe(
      data => {
        this.loaded.messages = -1;
      });

    this._csReadSub = this.chatService.read.subscribe(read => {        // изменение стилей после активности релэйшна?
      if (this.chat && +this.chat.id === +read.chat_id) {
        [].forEach.call(this.elref.nativeElement.querySelectorAll('i.readIcon:not([read="done_all"])'), (element) => {
          element.innerHTML = 'done_all';
          element.setAttribute('read', 'done_all');
        });
      }
    });

    this.configureFileUploader();
  }

  ngAfterViewChecked(): void {
    try {
      if (this.ListContainer && this.ToolBar) {
        this.dimensions.ListContainer = this.ListContainer.nativeElement.scrollHeight;
        this.dimensions.ToolBar = this.ToolBar.nativeElement.scrollHeight;
        this.dimensions.ListCollection = this.dimensions.ListContainer - 70 - this.dimensions.ToolBar;
      }
      this.ref.detectChanges();
    } catch (e) {
    }
  }

  openCurrentChat() {
    this._curChatSub = this.chatService.currentChatId.subscribe(chatId => {
      this.getChat(chatId);
      this.getMessages(chatId);
    });
  }

  getChat(chatId) {
    this._csGetChatSub = this.chatService.getChat(chatId).subscribe(chat => {
      this.chat = chat;
      if (chat.relations) {
        if (this.chatType === 1) {
          const client = chat.relations.find(value => value.companyName);
          if (client) {
            this.client = client;
            this.clientCompanyName = client.companyName || '';
            this.clientName = client.userName + ' ' + client.userSurname;
            this.clientPhoto = (client.companyLogo && client.companyLogo.length)
              ? (this._config.serverUrl + client.companyLogo[0].link) : '../assets/img/stubs/nologo.png';
          }
        }
        if (this.user && +chat.relations[0].userId === +this.user.id) {
          this.ownerRelation = 1;
        } else {
          this.ownerRelation = 0;
        }
      }
      this.page = 1;
      this.stuck = 0;
    });
  }

  getNewMessages() {
    this._csNewMessageSub = this.chatService.newMessage
      .subscribe(messages => {
        if (this.chat && messages && +this.chat.id === +messages.chat_id) {
          this.messages.push(messages);
          this.chatService.countUnread(messages.id, messages.chat_id, 3);
          setTimeout(() => {
            this.scrollToBottom();
          });
        }
      });
  }

  getMessages(chatId) {
    this._csGetMessagesSub = this.chatService.getMessages(chatId).subscribe((data) => {
      this.loaded.messages = 0;
      this.textareaValue = null;        // сообщение
      this.totalItems = data.total;
      this.messages = [];
      let messagesList = [];
      if (data.data) {
        messagesList = data.data.reverse();
      }
      messagesList.map(message => {
        this.messages.push(message);
        if (+message.status === 1) {
          this.chatService.countUnread(message.id, message.chat_id, 3);
        }
      });
      setTimeout(() => {
        [].forEach.call(this.elref.nativeElement.querySelectorAll('i.readIcon:not([read="done_all"])'), function (element) {
          element.setAttribute('read', 'done_all');
        });
        this.loaded.messages = 1;
      }, 400);
      if (this.mobile === 0) {
        setTimeout(() => {
          this.scrollToBottom();
          this.TextArea.nativeElement.focus();
        }, 500);
      }
    });
  }

  configureFileUploader() {
    this.uploader = new FileUploader({maxFileSize: this.maxFileSize});
    this.uploader.onAfterAddingFile = (fileItem: any) => {
      this.onFileEmit(fileItem);
    };
    this.uploader.onWhenAddingFileFailed = (item: FileLikeObject, filter: any, options: any) => {
      if (filter.name === 'fileSize') {
        this.snackBar.open('Превышен максимальный размер файла', 'ok', {
          duration: 3000,
        });
      } else {
        this.snackBar.open('Ошибка при добавлении файла', 'ok', {
          duration: 3000,
        });
      }
    };
  }

  closeChat() {
    const dialog = this.dialog.open(CloseChatDialogComponent);
    if (this._closeChatSub && !this._closeChatSub.closed) {
      this._closeChatSub.unsubscribe();
    }
    this._closeChatSub = dialog.afterClosed().pipe(switchMap(value => {
      if (value) {
        return this.chatService.closeSysChat(+this.chat.id);
      } else {
        return of(null);
      }
    })).subscribe(value => {
      if (value) {
        this.snackBar.open('Чат закрыт', 'ok', {
          duration: 3000,
        });
        this.chatService.contactsUpdate();
        this.chatWasClosed.emit();
      }
    });
  }

  banClient() {
    const dialog = this.dialog.open(BanClientDialogComponent);
    if (this._banClientSub && !this._banClientSub.closed) {
      this._banClientSub.unsubscribe();
    }
    this._banClientSub = dialog.afterClosed().subscribe(value => {
      if (value) {
        this.banned = true;
        this.bannedTo = moment().add(2, 'days').format('DD.MM.YY HH:mm');
        this.chatService.send(+this.chat.id, '',
          ChatMessageTypes.TYPE_SYSTEM_BAN, JSON.stringify({banned: true, bannedTo: this.bannedTo}));
      }
    });
  }

  nodeElement(type, user_id): string {        // стили сообщения в зависимотси от типа и юзера
    if (+user_id === +this.user.id && (type === ChatMessageTypes.TYPE_USER ||
      type === ChatMessageTypes.TYPE_SYSTEM_CALL || type === ChatMessageTypes.TYPE_FILE ||
      type === ChatMessageTypes.TYPE_IMAGE || type === ChatMessageTypes.TYPE_SYSTEM_FIRST_MESSAGE)) {
      return 'to';
    } else if (+user_id !== +this.user.id && (type === ChatMessageTypes.TYPE_USER ||
      type === ChatMessageTypes.TYPE_SYSTEM_CALL || type === ChatMessageTypes.TYPE_FILE ||
      type === ChatMessageTypes.TYPE_IMAGE || type === ChatMessageTypes.TYPE_SYSTEM_FIRST_MESSAGE)) {
      return 'from';
    } else if (type === ChatMessageTypes.TYPE_SYSTEM_DELETE_USER) {
      return 'deleted';
    } else if (type === ChatMessageTypes.TYPE_SYSTEM_ADD_USER) {
      return 'added';
    } else if (type === ChatMessageTypes.TYPE_ASSESSMENT) {
      return 'added';
    } else if (this.isSystemType(type)) {
      return 'added';
    }
  }

  nodeText(e): string {
    if (e) {
      return e.replace(new RegExp('\n', 'g'), '<br />');
    }
  }

  activityName(keyName) {
    if (keyName) {
      let keyActivity = keyName.replace(/s\s*$/, '');
      if (keyActivity === 'warehousesRent') {
        keyActivity = 'warehouseRent';
      }
      if (keyName && this.activities) {
        const activity = this.activities.find(acti => acti.keyName === keyActivity);
        if (activity) {
          return activity ? activity['name' + this._config.locale] : '';
        }
      }
    }
  }

  readMsg(msg) {        // галочки прочитано?
    let found = false;
    if (msg && msg['readby']) {
      found = true;
    } else {
      found = false;
    }
    return found ? 'done_all' : 'done';
  }

  scrollToBottom(): void {
    try {
      if (this.ListCollection) {
        this.ListCollection.nativeElement.scrollTop = this.ListCollection.nativeElement.scrollHeight;
        this.ref.detectChanges();
      }
    } catch (e) {
    }
  }

  time(date): string {        // дата на сообщении
    return moment(date).locale('ru').format('HH:mm');
  }

  sendByBtn(e): boolean {         // отправка по клику кнопки
    const text = this.textareaValue ? this.textareaValue : '';
    const nodeText = this.nodeText(text) ? this.nodeText(text) : '';
    const trimText = nodeText.trim() ? nodeText.trim() : '';

    if (!trimText) {
      return false;
    }
    this.chatService.send(this.chat.id, this.textareaValue);
    this.textareaValue = '';
    this.TextArea.nativeElement.focus();
    e.preventDefault();
    return true;
  }

  onScroll(e): void {
    if (e.target.scrollTop < 150 && this.stuck === 0) {
      this.loaded['loading'] = true;
      this.stuck = 1;
      this.getHistory();
    }
  }

  getHistory(): void {
    if (this.page * this.chatService.messagesLimit <= this.totalItems + 1) {
      if (this.chat) {
        this.page++;
        this.loaded['loading'] = true;
        this._csGetHistorySub = this.chatService.getHistory(this.chat.id, this.page).subscribe((messages: Message[]) => {
          const ListCollectionTo = this.ListCollection.nativeElement.clientHeight;
          let historyMessages = [];
          if (messages.length) {
            historyMessages = messages.reverse();
          }
          this.messages.unshift(...historyMessages);
          this.loaded['loading'] = false;
          this.stuck = 0;
          setTimeout(() =>
            this.ListCollection.nativeElement.scrollTop = ListCollectionTo);
          this.ref.detectChanges();
        }, err => {
          this.stuck = 0;
          this.page--;
          this.loaded['loading'] = false;
        });
      }
    } else {
      this.loaded['loading'] = false;
    }
  }

  declOfNum(n, titles) {
    return titles[(n % 10 === 1 && n % 100 !== 11) ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2];
  }

  summary(n) {
    const c = [
      // this.translate.instant('chat.companies1'),
      // this.translate.instant('chat.companies2'),
      // this.translate.instant('chat.companies3')
    ];
    return n + ' ' + this.declOfNum(n, c);
  }

  back() {            // кнопка назад в мобильных - возвращает в контакты
    this.chatService.setMobileDependency(1);
    this.chatService.destroyWindow();
  }

  onFileEmit(fileItem) {
    const formData = new FormData();
    formData.append('file', fileItem._file);
    if (this.allowedImageType.indexOf(fileItem._file.type) !== -1) {
      this._uploadService.uploadImage(formData)
        .subscribe((res: any) => {
          this.chatService.send(this.chat.id, res.links[0].name, ChatMessageTypes.TYPE_IMAGE, JSON.stringify(res.links[0]));
          this.snackBar.open('chat.fileSuccessfullyAdded', 'ok', {
            duration: 3000,
          });
        }, (err) => {
          this.snackBar.open(err.detail, 'ok', {
            duration: 3000,
          });
        });
    } else if (this.allowedDocType.indexOf(fileItem._file.type) !== -1 || fileItem._file.type === '') { // '' - для docx
      this._uploadService.uploadDocument(formData)
        .subscribe((res: any) => {
          this.chatService.send(this.chat.id, res.links[0].name, ChatMessageTypes.TYPE_FILE, JSON.stringify(res.links[0]));
          this.snackBar.open('chat.fileSuccessfullyAdded', 'ok', {
            duration: 3000,
          });
        }, (err) => {
          this.snackBar.open(err.detail, 'ok', {
            duration: 3000,
          });
        });
    } else {
      this.snackBar.open('chat.formatNotSupported', 'ok', {
        duration: 3000,
      });
    }
  }

  isSystemType(type: string): boolean {
    return type === ChatMessageTypes.TYPE_SYSTEM_QUESTION || type === ChatMessageTypes.TYPE_OPEN_WINDOW ||
      type === ChatMessageTypes.TYPE_CLOSE_WINDOW || type === ChatMessageTypes.TYPE_CLIENT_CHANGE_MODE ||
      type === ChatMessageTypes.TYPE_CLIENT_CONNECTED || type === ChatMessageTypes.TYPE_CLIENT_DISCONNECTED ||
      type === ChatMessageTypes.TYPE_SYSTEM_BAN;
  }

  isBlacklisted(message: Message): boolean {
    return this.isCloseQuestion(message) || this.isOpenWindow(message) || this.isCloseWindow(message) || this.isChangeMode(message) ||
      this.isClientConnected(message) || this.isClientDisconnected(message) || this.isBan(message);
  }

  isText(message: Message) {
    return message.type === ChatMessageTypes.TYPE_USER;
  }

  isImage(message: Message) {
    return message.type === ChatMessageTypes.TYPE_IMAGE;
  }

  isFile(message: Message) {
    return message.type === ChatMessageTypes.TYPE_FILE;
  }

  isDeleteUser(message: Message) {
    return message.type === ChatMessageTypes.TYPE_SYSTEM_DELETE_USER;
  }

  isAddUser(message: Message) {
    return message.type === ChatMessageTypes.TYPE_SYSTEM_ADD_USER;
  }

  isConsultantGreeting(message: Message) {
    return message.type === ChatMessageTypes.TYPE_SYSTEM_FIRST_MESSAGE;
  }

  isConsRate(message: Message) {
    return message.type === ChatMessageTypes.TYPE_ASSESSMENT;
  }

  isCloseQuestion(message: Message) {
    return message.type === ChatMessageTypes.TYPE_SYSTEM_QUESTION;
  }

  isOpenWindow(message: Message) {
    return message.type === ChatMessageTypes.TYPE_OPEN_WINDOW;
  }

  isCloseWindow(message: Message) {
    return message.type === ChatMessageTypes.TYPE_CLOSE_WINDOW;
  }

  isChangeMode(message: Message) {
    return message.type === ChatMessageTypes.TYPE_CLIENT_CHANGE_MODE;
  }

  isClientConnected(message: Message) {
    return message.type === ChatMessageTypes.TYPE_CLIENT_CONNECTED;
  }

  isClientDisconnected(message: Message) {
    return message.type === ChatMessageTypes.TYPE_CLIENT_DISCONNECTED;
  }

  isBan(message: Message) {
    return message.type === ChatMessageTypes.TYPE_SYSTEM_BAN;
  }

  ngOnDestroy() {
  }
}
