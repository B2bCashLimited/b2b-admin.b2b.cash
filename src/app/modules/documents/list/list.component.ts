import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, PageEvent } from '@angular/material';
import { DateRangeComponent } from '@b2b/shared/dialogs/date-range-popup/date-range-popup.component';
import { debounceTime, distinctUntilChanged, first, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { ActivityNameModel, Country, DocumentsList } from '@b2b/models';
import { DocumentsListService } from '@b2b/services/documents-list.service';
import { removeEmptyProperties } from '@b2b/utils';
import { ActivityIcons } from '@b2b/enums';
import { clearSubscription } from '@b2b/decorators';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, Subject, Subscription } from 'rxjs';
import * as moment from 'moment';
import { ConfigService } from '@b2b/services/config.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'b2b-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, OnDestroy {

  displayedColumns: string[] = ['number', 'send-day', 'document-type', 'document-template', 'company-or-vd', 'country', 'flag', 'action'];

  documentTypes = [
    {
      label: 'Все',
      value: 0
    },
    {
      label: 'Акт',
      value: 1
    },
    {
      label: 'Счёт',
      value: 2
    },
    {
      label: 'Инвойс',
      value: 3
    }
  ];

  deliveryStatuses = [
    {
      label: 'Все',
      value: 0
    },
    {
      label: 'Будет отправлено',
      value: 1
    },
    {
      label: 'Было отправлено',
      value: 2
    }
  ];

  formGroup: FormGroup;
  isLoading = false;
  pageCount = 0;
  pageSize = 0;
  pageIndex = 0;
  totalItems = 0;
  documentsList: DocumentsList[] = [];
  activityIcons = ActivityIcons;
  documentDownloadApiUrl = this._config.apiUrl + '/document-download';
  queryParams: any = this._route.snapshot.queryParams;
  selectedCountryId: number;
  selectedActivityNameId: number;

  maxDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  minDate = new Date(new Date().getFullYear() - 2, new Date().getMonth(), new Date().getDate());
  startDate: string | Date = new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate());
  finishDate: string | Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  private _currentPage = 1;
  private _pageSub: Subscription;
  private _unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private _matDialog: MatDialog,
    private _formBuilder: FormBuilder,
    private _documentsListService: DocumentsListService,
    private _config: ConfigService,
    private _router: Router,
    private _route: ActivatedRoute
  ) {
  }

  ngOnDestroy(): void {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }

  ngOnInit() {
    this._initFormGroup();
    this._patchQueryParamsValues();

    this.formGroup.valueChanges
      .pipe(
        startWith(this.formGroup.value),
        distinctUntilChanged(),
        debounceTime(300),
        switchMap((res: any) => {
          this.queryParams = {...res};
          return this._getDocumentsList();
        }),
        takeUntil(this._unsubscribe$)
      )
      .subscribe(() => this.isLoading = false, () => this.isLoading = false);
  }

  /**
   * Fires event every time country selected
   */
  onCountriesChanged(evt: Country): void {
    this.formGroup.get('country').setValue(evt && evt.id || null);
  }

  /**
   * Opens date picker dialog to choose periods
   */
  onDateChange() {
    const data: any = {
      minDate: this.minDate,
      maxDate: this.maxDate,
      startDate: this.startDate,
      finishDate: this.finishDate,
    };

    this._matDialog.open(DateRangeComponent, {
      width: '400px',
      height: 'auto',
      data
    }).afterClosed()
      .pipe(first())
      .subscribe(resp => {
        if (resp) {
          const [dateFrom, dateTo] = resp;

          if (resp.length === 2) {
            if (dateFrom.getTime() < dateTo.getTime()) {
              this.startDate = dateFrom;
              this.finishDate = dateTo || dateFrom;
            } else {
              this.startDate = dateTo || dateFrom;
              this.finishDate = dateFrom;
            }
          } else if (resp.length === 1) {
            this.startDate = this.finishDate = dateFrom;
          }

          this.formGroup.get('dateFrom').setValue(moment(this.startDate).format('YYYY-MM-DD'));
          this.formGroup.get('dateTo').setValue(moment(this.finishDate).format('YYYY-MM-DD'));
        }
      });
  }

  /**
   * Fires event every time activity name changed
   */
  onActivityNameChanged(evt: ActivityNameModel): void {
    this.formGroup.get('activityName').setValue(evt && evt.id || null);
  }

  /**
   * Fires an event every time page changed
   */
  onPageChanged(evt: PageEvent): void {
    const pageIndex = evt.pageIndex + 1;
    this._currentPage = pageIndex <= this.pageCount ? Math.min(pageIndex, this.pageCount) : 1;
    clearSubscription(this._pageSub);
    this._pageSub = this._getDocumentsList()
      .subscribe(() => this.isLoading = false, () => this.isLoading = false);
  }

  /**
   * Form group initialization
   */
  private _initFormGroup(): void {
    this.formGroup = this._formBuilder.group({
      documentType: 0,
      country: null,
      documentName: null,
      recipientName: null,
      isProcessed: 0,
      activityName: null,
      dateFrom: moment(this.startDate).format('YYYY-MM-DD'),
      dateTo: moment(this.finishDate).format('YYYY-MM-DD')
    });
  }

  /**
   * Retrieves documents' list
   */
  private _getDocumentsList(): Observable<any> {
    this.isLoading = true;
    return this._documentsListService.getDocumentsList(removeEmptyProperties(this.formGroup.value), this._currentPage)
      .pipe(
        map((res: any) => {
          this.pageSize = res.pageSize;
          this.pageCount = res.pageCount;
          this.totalItems = res.totalItems;
          this.documentsList = res.listDocuments;
        })
      );
  }

  /**
   * Patches queryParams values to form group
   */
  private _patchQueryParamsValues(): void {
    const queryParams: any = {...this.queryParams};

    if (queryParams.documentType) {
      queryParams.documentType = +queryParams.documentType;
    }

    if (this.queryParams.isProcessed) {
      queryParams.isProcessed = +queryParams.isProcessed;
    }

    if (queryParams.country) {
      this.selectedCountryId = +queryParams.country;
    }

    if (queryParams.activityName) {
      this.selectedActivityNameId = +queryParams.activityName;
    }

    if (queryParams.dateFrom && moment(queryParams.dateFrom, 'YYYY-MM-DD', true).isValid()) {
      this.startDate = new Date(queryParams.dateFrom);
    } else {
      queryParams.dateFrom = moment(this.startDate).format('YYYY-MM-DD');
    }

    if (queryParams.dateTo && moment(queryParams.dateTo, 'YYYY-MM-DD', true).isValid()) {
      this.finishDate = new Date(queryParams.dateTo);
    } else {
      queryParams.dateTo = moment(this.finishDate).format('YYYY-MM-DD');
    }

    this.formGroup.patchValue(queryParams);
  }

}
