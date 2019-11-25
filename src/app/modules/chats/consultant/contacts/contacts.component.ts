import {
  Component,
  ViewChild,
  OnInit,
  ChangeDetectorRef,
  Input,
  ElementRef,
  AfterViewChecked,
  HostListener,
  OnDestroy
} from '@angular/core';
import {
  MatDialog
} from '@angular/material';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import * as moment from 'moment';
import {FormControl} from '@angular/forms';
import {ClearSubscriptions} from '@b2b/decorators';
import {ChatGetResponse, Contact} from '../../models';
import {User} from '../../../moderation/products/models/user.model';
import {interval, Subscription} from 'rxjs';
import {ChatService} from '../../chat.service';
import {ConfigService} from '@b2b/services/config.service';

@ClearSubscriptions()
@Component({
  // tslint:disable-next-line
  selector: 'app-chat-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: [
    './contacts.component.scss'
  ]
})
export class ChatContactsComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('ListCollection') public ListCollection: ElementRef;
  @ViewChild('ListContainer') public ListContainer: ElementRef;
  @Input() activities: any[];
  isInWork = false;
  curChatId = 0;
  public filtered: Contact[] = [];
  public activeCategory: FormControl;
  public dimensions = {
    ListCollection: 0,
    ListContainer: 0
  };
  NO_LOGO_URL = '../assets/img/stubs/nologo.png';
  loading = false;
  searchInput: FormControl;
  emptyList = true;
  totalItems = 0;
  page = 1;
  readyToLoadMore = true;
  timers: string[] = [];
  user: User;
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
  readonly CLOSED_BY = {
    inWork: 'inWork',
    absense: 'absense',
    posRate: 'posRate',
    negRate: 'negRate',
    ban: 'ban'
  };
  private _activeCatSub: Subscription;
  private _chatAutoclosedSub: Subscription;
  private _contactsSub: Subscription;
  private _contactUpdateSub: Subscription;
  private _intervalSub: Subscription;
  private _curChatSub: Subscription;
  private _searchSub: Subscription;

  constructor(
    private dialog: MatDialog,
    private ref: ChangeDetectorRef,
    private chatService: ChatService,
    public config: ConfigService) {
  }

  ngAfterViewChecked(): void {
    this.ref.detectChanges();
  }

  ngOnInit() {
    this.initSearchFormControls();
    this.getContacts();
    /*this.chatService.consultantIsInWork.subscribe(value => {
      this.isInWork = value;
      if (value) {
        this.page = 1;
        this.getContacts();
      }
    });*/
    this._contactUpdateSub = this.chatService.contacts.subscribe(value => {
      this.page = 1;
      this.getContacts();
    });
    this.assignTimers();
    this._curChatSub = this.chatService.currentChatId.subscribe(value => {
      this.curChatId = +value;
    });
    this._chatAutoclosedSub = this.chatService.chatAutoclosed.subscribe(value => {
      this.page = 1;
      this.getContacts();
    });
  }

  getContacts() {
    if (this._contactsSub && !this._contactsSub.closed) {
      this._contactsSub.unsubscribe();
    }
    this._contactsSub = this.chatService.getContacts({
      text: this.searchInput.value,
      select: this.activeCategory.value
    }, this.page).subscribe((value: ChatGetResponse) => {
      if (this.page > 1) {
        this.filtered = [...this.filtered, ...value['_embedded']['chat']];
      } else {
        this.filtered = value['_embedded']['chat'];
      }
      this.totalItems = value['total_items'];
      this.dimensions.ListCollection =
        this.ListContainer.nativeElement.clientHeight - this.ListCollection.nativeElement.clientHeight;
      this.loading = false;
      this.emptyList = false;
      this.readyToLoadMore = true;
    });
  }

  getMore(): void {
    if (this.readyToLoadMore && this.page * this.chatService.contactsLimit <= this.totalItems + 1) {
      this.page++;
      this.readyToLoadMore = false;
      this.getContacts();
    }
  }

  initSearchFormControls() {
    this.searchInput = new FormControl('');
    this.activeCategory = new FormControl(-1);
    this._searchSub = this.searchInput.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe(value => {
      this.page = 1;
      this.getContacts();
    });
    this._activeCatSub = this.activeCategory.valueChanges.pipe(distinctUntilChanged()).subscribe(value => {
      this.page = 1;
      this.getContacts();
    });
  }

  getContactLogoUrl(contact: Contact): string {
    let logoUrl = this.NO_LOGO_URL;
    if (contact.logo) {
      logoUrl = this.config.serverUrl + '/data/images/' + contact.logo;
    } else if (contact.avatars && contact.avatars.length && contact.avatars[0] && contact.avatars[0].length) {
      logoUrl = this.config.serverUrl + contact.avatars[0][0].link;
    }
    return logoUrl;
  }

  time(date: string): string {
    const daysAgo = moment().diff(moment(date), 'days');
    switch (daysAgo) {
      case 0: {
        return moment(date)
          .locale('ru')
          .format('LT');
      }
      case 1: {
        return 'вчера';
      }
      case 2: {
        return 'позавчера';
      }
      default: {
        return `${daysAgo} дней назад`;
      }
    }
  }

  assignTimers() {
    const inter = interval(1000);
    this._intervalSub = inter.subscribe(tick => {
      this.filtered.map((value: Contact, i) => {
        if (!value.closed) {
          // this.addTimer(value);        // таймеры записываются в контакт
          const diff = moment().diff(moment(value.dateCreated.date));
          this.timers[i] = moment(diff).format('mm:ss');      // таймеры в отдельном массиве
        }
      });
    });
  }

  addTimer(contact: Contact) {
    const diff = moment().diff(moment(contact.dateCreated.date));
    contact['timer'] = moment(diff).format('mm:ss');
  }

  activityName(keyName) {
    if (keyName) {
      let keyActivity = keyName.replace(/s\s*$/, '');
      if (keyActivity === 'warehousesRent') {
        keyActivity = 'warehouseRent';
      }
      const activity = this.activities.find(active => active.keyName === keyActivity);
      if (activity) {
        return activity ? activity[`name${this.config.locale}`] : '';
      }
    }
  }

  activityKey(keyName) {
    if (keyName) {
      let keyActivity = keyName.replace(/s\s*$/, '');
      if (keyActivity === 'warehousesRent') {
        keyActivity = 'warehouseRent';
      }
      return keyActivity;
    }
  }

  isCurrentChat(contact: Contact) {
    return +contact.id === this.curChatId;
  }

  getCountry2Letters(country: {
    id: string;
    nameCn: string;
    nameEn: string;
    nameRu: string;
  }) {
    switch (country.nameRu) {
      case 'Россия': {
        return 'ru';
      }
      case 'Китай': {
        return 'cn';
      }
      case 'Украина': {
        return 'ua';
      }
      default: {
        return 'eu';
      }
    }
  }

  closed(contact: Contact): {
    class: string;
    icon: string;
    message: string;
  } {
    switch (contact.closedBy) {
      case this.CLOSED_BY.inWork: {
        return {
          class: 'inwork',
          icon: '',
          message: 'в работе'  // 'в работе'
        };
      }
      case this.CLOSED_BY.absense: {
        return {
          class: 'absense',
          icon: '',
          message: 'закрыт'    // 'закрыт'
        };
      }
      case this.CLOSED_BY.posRate: {
        return {
          class: 'posrate',
          icon: 'emoticon-excited',
          message: 'закрыт'    // 'закрыт'
        };
      }
      case this.CLOSED_BY.negRate: {
        return {
          class: 'negrate',
          icon: 'emoticon-dead',
          message: 'закрыт'    // 'закрыт'
        };
      }
      case this.CLOSED_BY.ban: {
        return {
          class: 'ban',
          icon: 'cancel-circle',
          message: 'закрыт'    // 'закрыт'
        };
      }
    }
  }

  openChat(contact: Contact): void {
    this.chatService.currentChatLogo = this.getContactLogoUrl(contact);
    this.chatService.openChat(+contact.id);
  }

  ngOnDestroy() {
  }

  @HostListener('window:beforeunload', ['$event']) unloadHandler(event: Event) {
    // localStorage.setItem('chat', JSON.stringify({ section: this.chatToggle, owner: 1 }));
    this.chatService.destroyWindow();
  }
}
