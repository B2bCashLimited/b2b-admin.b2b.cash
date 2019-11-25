import {Component, OnInit} from '@angular/core';
import {MatDialog, MatTableDataSource, PageEvent} from '@angular/material';
import {MailerService} from '../../mailer.service';
import {filter, map, switchMap} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {ConfirmDeleteTemplateComponent} from './dialogs/confirm-delete-template/confirm-delete-template.component';

export interface TemplateTableElement {
  id: number;
  clientType: number;
  userType: number;
  name: string;
  subject: string;
}

@Component({
  selector: 'b2b-templates-index',
  templateUrl: './templates-index.component.html',
  styleUrls: ['./templates-index.component.scss']
})
export class TemplatesIndexComponent implements OnInit {
  pageCount = 0;
  pageSize = 0;
  length = 0;
  displayedColumns: string[] = ['name', 'subject', 'userType', 'clientType', 'actions'];
  dataSource = new MatTableDataSource<TemplateTableElement>();
  templates: any;

  private _currentPage = 1;
  private _templatesSub: Subscription;

  constructor(private _mailerService: MailerService,
              private _matDialog: MatDialog) {
  }

  ngOnInit(): void {
    this._getHtmlTemplates().subscribe();
  }

  onDestroyClick(template: TemplateTableElement): void {
    this._matDialog.open(ConfirmDeleteTemplateComponent, {
      width: '500px',
      disableClose: true,
    }).afterClosed()
      .pipe(
        filter((res) => res && !!res),
        switchMap(() => {
          const data: any = {
            status: 5,
            clientType: template.clientType,
            userType: template.userType
          };
          return this._mailerService.destroyHtmlTemplate(template.id, data);
        })
      )
      .subscribe(() => {
        this.dataSource.data = this.templates.filter(item => item.id !== template.id);
      });
  }

  getPage(pageEvent: PageEvent): void {
    const pageIndex = pageEvent.pageIndex + 1;
    this._currentPage = pageIndex <= this.pageCount ? Math.min(pageIndex, this.pageCount) : 1;
    if (this._templatesSub && !this._templatesSub.closed) {
      this._templatesSub.unsubscribe();
    }
    this._templatesSub = this._getHtmlTemplates(this._currentPage).subscribe();
  }

  private _getHtmlTemplates(page = 1) {
    return this._mailerService.getHtmlTemplates(null, page)
      .pipe(
        map((res: any) => {
          this.pageSize = res.pageSize;
          this.pageCount = res.pageCount;
          this.length = res.totalItems;
          this.templates = res.templates;
          this.setTableData(res.templates);
        })
      );
  }

  private setTableData(templates: any[]) {
    const data: TemplateTableElement[] = [];

    for (const template of templates) {
      data.push(
        {
          id: template.id,
          name: template.name,
          subject: template.subject,
          userType: template.userType,
          clientType: template.clientType,
        }
      );
    }

    this.dataSource.data = data;
  }
}
