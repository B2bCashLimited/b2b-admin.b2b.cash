import {Component, OnInit} from '@angular/core';
import {MatTableDataSource, PageEvent} from '@angular/material';
import {map, switchMap} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {MailerService} from '../mailer.service';
import {clearSubscription} from '@b2b/decorators';
import {FormBuilder, FormGroup} from '@angular/forms';

export interface SendMessagesTableElement {
  id: number;
  clientType: number;
  sendGroup: string;
  subject: string;
  statistics: any;
  dateCreated: string;
  htmlTemplate: any;
  user: any;
  senderEmail: any;
}

@Component({
  selector: 'b2b-sent',
  templateUrl: './sent.component.html',
  styleUrls: ['./sent.component.scss']
})
export class SentComponent implements OnInit {
  readonly USERS_TYPES = [
    [
      {type: 'Все', value: null},
      {type: 'текущие', value: 1},
      {type: 'будущие', value: 2}
    ],
    [
      {type: 'Все', value: null},
      {type: 'покупатель', value: 1},
      {type: 'продавец', value: 2}
    ]
  ];
  pageCount = 0;
  pageSize = 0;
  length = 0;
  displayedColumns: string[] = ['initiator', 'date', 'clientType', 'group', 'sender', 'template', 'subject', 'statistics', 'actions'];
  dataSource = new MatTableDataSource<SendMessagesTableElement>();
  formGroup: FormGroup;

  private _currentPage = 1;
  private _templatesSub: Subscription;

  constructor(
    private _mailerService: MailerService,
    private _formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.formGroup = this._formBuilder.group({
      userType: {type: 'Все', value: null},
      clientType: {type: 'Все', value: null},
    });
    this._getHtmlTemplates().subscribe();
    this.formGroup.valueChanges
      .pipe(
        switchMap(() => this._getHtmlTemplates())
      ).subscribe();
  }

  getPage(pageEvent: PageEvent): void {
    const pageIndex = pageEvent.pageIndex + 1;
    this._currentPage = pageIndex <= this.pageCount ? Math.min(pageIndex, this.pageCount) : 1;
    clearSubscription(this._templatesSub);
    this._templatesSub = this._getHtmlTemplates(this._currentPage).subscribe();
  }

  onDeleteSentMailClick(id: number) {
    this._mailerService.deleteSending(id)
      .subscribe(() => {
        this.dataSource.data = this.dataSource.data.filter(item => item.id !== id);
      });
  }

  private _getHtmlTemplates(page = 1) {
    const {userType, clientType} = this.formGroup.value;
    return this._mailerService.getSendings(userType.value, clientType.value, page)
      .pipe(
        map((res: any) => {
          this.pageSize = res.pageSize;
          this.pageCount = res.pageCount;
          this.length = res.totalItems;
          this.setTableData(res.sendings);
        })
      );
  }

  private setTableData(sendings: any[]) {
    const data: SendMessagesTableElement[] = [];
    for (const sending of sendings) {
      const sendGroup = Object.values(sending.sendGroup)
        .map(name => name).join(', ');
      data.push(
        {
          id: sending.id,
          clientType: sending.clientType,
          sendGroup,
          senderEmail: sending.senderEmail,
          statistics: this._mailerService.getSendingsStatistics(sending.id),
          subject: sending.subject,
          htmlTemplate: sending.htmlTemplate,
          user: sending.user,
          dateCreated: sending.dateCreated,
        }
      );
    }
    this.dataSource.data = data;
  }
}
