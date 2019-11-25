import {Component, OnInit} from '@angular/core';
import {getClientType, MailerService} from '../mailer.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {debounceTime, distinctUntilChanged, map, startWith, switchMap, tap} from 'rxjs/operators';
import {merge, Subject, Subscription} from 'rxjs';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {UserService} from '@b2b/services/user.service';
import {UserType} from '@b2b/enums';
import {clearSubscription} from '@b2b/decorators';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'b2b-compose',
  templateUrl: './compose.component.html',
  styleUrls: ['./compose.component.scss']
})
export class ComposeComponent implements OnInit {

  sendGroupsLoading = false;
  sendersLoading = false;
  templatesLoading = false;
  formGroup: FormGroup;
  length = 0;
  pageCount = 0;
  pageSize = 0;
  sendGroups: any = [];
  templates: any = [];
  senders: any = [];
  sendLists: any = [];
  sendGroupsInput$ = new Subject<string>();
  templatesInput$ = new Subject<string>();
  sendersInput$ = new Subject<string>();
  selectedSendGroups: any;
  selectedSendLists: any;
  safeTemplate: SafeHtml;

  private _currentPage = 1;
  private _groupsSub: Subscription;
  private _sendersSub: Subscription;

  constructor(
    private _mailerService: MailerService,
    private _formBuilder: FormBuilder,
    private _userService: UserService,
    private _domSanitizer: DomSanitizer,
    private _toastrService: ToastrService) {
  }

  ngOnInit() {
    this.formGroup = this._formBuilder.group({
      userType: 2,
      clientType: this._formBuilder.group({
        buyer: true,
        seller: false,
      }),
      group: null,
      verificationEmails: false,
      template: null,
      sender: [null, [Validators.required]],
      subject: [{value: null, disabled: true}, [Validators.required]],
    });

    this.formGroup.get('userType').valueChanges
      .pipe(
        startWith(UserType.FutureUsers)
      )
      .subscribe((userType: number) => {
        if (userType === UserType.FutureUsers) {
          this.formGroup.get('clientType').disable();
        } else {
          this.formGroup.get('clientType').enable();
        }
        this.sendGroups = [];
      });

    this.formGroup.get('template').valueChanges
      .subscribe((data: any) => {
        if (data) {
          this.formGroup.get('subject').enable();
          this.formGroup.get('subject').patchValue(data.subject);
          const template = (data.template || '').replace(/{\$siteUrl}/g, location.origin);
          this.safeTemplate = this._domSanitizer.bypassSecurityTrustHtml(template);
        } else {
          this.safeTemplate = null;
          this.formGroup.get('subject').disable();
          this.formGroup.get('subject').patchValue(null);
        }
      });

    this._getSendGroups().subscribe();
    this._getHtmlTemplates().subscribe();
    this._getEmailSenders().subscribe();
    this._handleSendGroups();
    this._handleTemplates();
    this._handleSenders();
    merge(
      this.formGroup.get('userType').valueChanges,
      this.formGroup.get('clientType').valueChanges
    ).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(() => {
        this.selectedSendGroups = null;
        this.selectedSendLists = null;
        return this._getSendGroups();
      })
    ).subscribe();
  }

  onSendGroupsChanged(sendGroups: any[]) {
    this.sendLists = sendGroups.reduce((groups, group) => {
      return [...groups, ...group.sendList];
    }, []);
    this.selectedSendGroups = sendGroups;
  }

  onSendListsChanged(sendLists: any[]) {
    this.selectedSendLists = sendLists;
  }

  onSendGroupsScrollToEnd(): void {
    this._currentPage++;
    this._currentPage = this._currentPage <= this.pageCount ? Math.min(this._currentPage, this.pageCount) : 1;
    clearSubscription(this._groupsSub);
    if (this._currentPage > 1) {
      this._groupsSub = this._getSendGroups(this._currentPage).subscribe();
    }
  }

  onTemplatesScrollToEnd(): void {
    this._currentPage++;
    this._currentPage = this._currentPage <= this.pageCount ? Math.min(this._currentPage, this.pageCount) : 1;
    clearSubscription(this._groupsSub);
    if (this._currentPage > 1) {
      this._groupsSub = this._getHtmlTemplates(this._currentPage).subscribe();
    }
  }

  onSendersScrollToEnd() {
    this._currentPage++;
    this._currentPage = this._currentPage <= this.pageCount ? Math.min(this._currentPage, this.pageCount) : 1;
    clearSubscription(this._sendersSub);
    if (this._currentPage > 1) {
      this._sendersSub = this._getEmailSenders(this._currentPage).subscribe();
    }
  }

  onSubmitClick() {
    const {clientType, userType, text, subject, sender, template, verificationEmails} = this.formGroup.value;
    const body = {
      clientType: clientType && getClientType(clientType.buyer, clientType.seller),
      htmlTemplate: template.id,
      listEmail: this.selectedSendLists.map(item => item.id),
      senderEmail: sender.id,
      sendGroup: this.selectedSendGroups.map(item => item.id),
      subject,
      text,
      user: this._userService.currentUser.id,
      userType,
      verificationEmails,
    };
    this._mailerService.sendMail(body)
      .subscribe(() => {
        this._toastrService.success('Письмо успешно отправлено!');
        this.formGroup.reset({
          userType: 2,
          clientType: this._formBuilder.group({
            buyer: true,
            seller: false,
          }),
          group: null,
          template: null,
        });
      });
  }

  private _handleSendGroups() {
    this.sendGroupsInput$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(() => this._getSendGroups())
      ).subscribe();
  }

  private _handleTemplates() {
    this.templatesInput$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(() => this._getHtmlTemplates())
      ).subscribe();
  }

  private _handleSenders() {
    this.sendersInput$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(() => this._getEmailSenders())
      ).subscribe();
  }

  private _getSendGroups(page = 1) {
    this.sendGroupsLoading = true;
    return this._mailerService.getSendGroups(this.formGroup.value, page)
      .pipe(
        map((res: any) => {
          this.sendGroupsLoading = false;
          this.pageSize = res.pageSize;
          this.pageCount = res.pageCount;
          this.length = res.totalItems;
          return this.sendGroups = [...this.sendGroups, ...res.sendGroups];
        })
      );
  }

  private _getHtmlTemplates(page = 1) {
    this.templatesLoading = true;
    return this._mailerService.getHtmlTemplates(null, page)
      .pipe(
        map((res: any) => {
          this.templatesLoading = false;
          this.pageSize = res.pageSize;
          this.pageCount = res.pageCount;
          this.length = res.totalItems;
          return this.templates = [...this.templates, ...res.templates];
        })
      );
  }

  private _getEmailSenders(page = 1) {
    this.sendersLoading = true;
    return this._mailerService.getEmailSenders(null, page)
      .pipe(
        map((res: any) => {
          this.sendersLoading = false;
          this.pageSize = res.pageSize;
          this.pageCount = res.pageCount;
          this.length = res.totalItems;
          res.senders.forEach((sender) => {
            sender['nameEmail'] = `${sender.name} - ${sender.email}`;
          });
          return this.senders = [...this.senders, ...res.senders];
        })
      );
  }

}
