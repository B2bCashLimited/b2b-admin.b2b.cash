import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ConfigService} from '@b2b/services/config.service';
import {MailerService} from '../../../mailer.service';
import {FormBuilder} from '@angular/forms';
import {Observable, Subject, Subscription} from 'rxjs';
import {debounceTime, distinctUntilChanged, map, switchMap, tap} from 'rxjs/operators';
import {UploadFile, UploadInput, UploadOutput, UploadStatus} from 'ngx-uploader';
import {AuthToken} from '@b2b/models';
import {getFromLocalStorage} from '@b2b/utils';
import {LocationService} from '@b2b/services/location.service';
import {CategoryService} from '@b2b/services/category.service';
import {clearSubscription, ClearSubscriptions} from '@b2b/decorators';

@ClearSubscriptions()
@Component({
  selector: 'b2b-send-group-item',
  templateUrl: './send-group-item.component.html',
  styleUrls: ['./send-group-item.component.scss']
})
export class SendGroupItemComponent implements OnDestroy, OnInit {
  @Output() destroyGroup = new EventEmitter<any>();
  @Input() group: any;

  listsLoading = false;
  listsInput = new Subject<string>();
  uploadInput = new EventEmitter<UploadInput>();
  files: UploadFile[] = [];
  length = 0;
  pageCount = 0;
  pageSize = 0;
  sendLists: any = [];
  selectedSendList: any;
  countries$: Observable<any>;
  loading = true;

  categoriesInput = new Subject<string>();
  categoriesLoading = false;
  categories: any = [];
  categoriesPageSize = 0;
  categoriesPageCount = 0;
  categoriesLength = 0;

  private _dragOver = false;
  private _categoriesSub: Subscription;
  private _listsSub: Subscription;
  private _currentPage = 1;
  private _categoriesCurrentPage = 1;

  constructor(
    private _config: ConfigService,
    private _mailerService: MailerService,
    private _formBuilder: FormBuilder,
    private _locationService: LocationService,
    private _categoryService: CategoryService) {
  }

  ngOnDestroy() {
    // @ClearSubscriptions()
  }

  ngOnInit() {
    this.countries$ = this._locationService.getCountries()
      .pipe(
        tap(() => this.loading = false)
      );

    this._handleLists();
    this._handleCategories();
    this._getSendLists().subscribe();
  }

  onDestroyGroupClick(evt: MouseEvent) {
    evt.stopPropagation();
    this.destroyGroup.emit(this.group);
  }

  onSaveGroupClick() {
    if (this.group && this.group.id) {
      this._mailerService.updateSendGroup(this.group).subscribe();
    } else {
      this._mailerService.createSendGroup(this.group)
        .subscribe((res: any) => this.group.id = res.id);
    }
  }

  onListsScrollToEnd() {
    this._currentPage++;
    this._currentPage = this._currentPage <= this.pageCount ? Math.min(this._currentPage, this.pageCount) : 1;
    clearSubscription(this._listsSub);
    this._listsSub = this._getSendLists({name: ''}, this._currentPage).subscribe();
  }

  onSelectedListsChanged(list) {
    this.selectedSendList = [];
    this.group.sendList = [list, ...this.group.sendList];
    this._mailerService.updateSendGroup(this.group).subscribe();
  }

  onAddNewListClick() {
    const list = {
      name: 'Новый лист',
      userType: 1,
      sendListFiles: []
    };
    this.group.sendList = [list, ...this.group.sendList];
    if (this.group.sendList.length === 1 && this.group.userType === 1) {
      const body = {
        type: this.group.clientType,
        countries: this.group.sendGroupCountry.map(itm => itm.id),
        categories: this.group.sendGroupCategory.map(itm => itm.id),
        activityNames: this.group.sendGroupActivityNames,
      };
      this._mailerService.getCurrentEmailsCsv(body)
        .subscribe(
          (file: any) => {
            list.sendListFiles.push(file);
          },
          () => {
            // TODO Email list not found!
          }
        );
    }
  }

  onDestroyListClick(evt: MouseEvent, list: any, index: number) {
    evt.stopPropagation();
    if (list.id) {
      this._mailerService.destroySendList(list.id, this.group).subscribe();
    } else {
      this.group.sendList.splice(index, 1);
    }
  }

  onSaveListClick(list) {
    if (list.id) {
      this._mailerService.updateSendList(list).subscribe();
    } else {
      this._mailerService.createSendList(list)
        .pipe(
          switchMap((res: any) => {
            list.id = res.id;
            return this._mailerService.updateSendGroup(this.group);
          })
        )
        .subscribe();
    }
  }

  onRemoveFileClick(list, file) {
    list.sendListFiles = list.sendListFiles.filter(item => item.id !== file.id);
  }

  onUploadOutput(output: UploadOutput, list): void {
    if (output.type === 'allAddedToQueue') {
      const auth: AuthToken = getFromLocalStorage('B2B_TOKEN');
      const event: UploadInput = {
        type: 'uploadAll',
        url: `${this._config.apiUrl}/upload/file`,
        method: 'POST',
        headers: {'Authorization': `${auth.token_type} ${auth.access_token}`},
        data: {type: '1'}
      };
      this.uploadInput.emit(event);
    } else if (output.type === 'addedToQueue' && typeof output.file !== 'undefined') {
      this.files.push(output.file);
    } else if (output.type === 'uploading' && typeof output.file !== 'undefined') {
      const index = this.files.findIndex(file => file.id === output.file.id);
      this.files[index] = output.file;
    } else if (output.type === 'removed') {
      this.files = this.files.filter(file => file !== output.file);
    } else if (output.type === 'dragOver') {
      this._dragOver = true;
    } else if (output.type === 'dragOut') {
      this._dragOver = false;
    } else if (output.type === 'drop') {
      this._dragOver = false;
    } else if (output.type === 'done') {
    }

    this.files.forEach((file: UploadFile) => {
      if (file.progress.status === 2) {
        list.sendListFiles.push(file.response);
      }
    });

    this.files = this.files.filter(file => file.progress.status !== UploadStatus.Done);
  }

  onCategoriesScrollToEnd(): void {
    this._categoriesCurrentPage++;
    this._categoriesCurrentPage = this._categoriesCurrentPage <= this.pageCount ? Math.min(this._categoriesCurrentPage, this.pageCount) : 1;
    if (this._categoriesSub && !this._categoriesSub.closed) {
      this._categoriesSub.unsubscribe();
    }
    this._categoriesSub = this._getCategories(null, this._categoriesCurrentPage).subscribe();
  }

  private _handleCategories() {
    this.categoriesInput
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => this.categories = []),
        switchMap((name: string) => this._getCategories(name))
      ).subscribe();
  }

  private _getCategories(name = '', page = 1) {
    this.categoriesLoading = true;
    return this._categoryService.getCategories(name, page)
      .pipe(
        map((res: any) => {
          this.categoriesLoading = false;
          this.categoriesPageSize = res.pageSize;
          this.categoriesPageCount = res.pageCount;
          this.categoriesLength = res.totalItems;
          return this.categories = [...this.categories, ...res.categories];
        })
      );
  }

  private _handleLists() {
    this.listsInput
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => this.sendLists = []),
        switchMap((name: string) => this._getSendLists({name}))
      ).subscribe();
  }

  private _getSendLists(filter = {}, page = 1) {
    this.listsLoading = true;
    return this._mailerService.getSendLists(filter, page)
      .pipe(
        map((res: any) => {
          this.listsLoading = false;
          this.pageSize = res.pageSize;
          this.pageCount = res.pageCount;
          this.length = res.totalItems;
          return this.sendLists = [...this.sendLists, ...res.sendLists];
        })
      );
  }

}
