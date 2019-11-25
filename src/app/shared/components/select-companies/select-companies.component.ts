import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { clearSubscription } from '@b2b/decorators';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { StatisticsAnalyticsService } from '@b2b/services/statistics-analytics.service';

@Component({
  selector: 'b2b-select-companies',
  templateUrl: './select-companies.component.html',
  styleUrls: ['./select-companies.component.scss']
})
export class SelectCompaniesComponent implements OnInit, OnDestroy {

  @Input() set reset(bool: boolean) {
    if (bool) {
      this._selectedCompanies = [];
      this.companies = [];
    }
  }

  @Input() multiple = false;
  @Input() disabled = false;
  @Input() countryId: number;

  get selectedCompanies() {
    return this._selectedCompanies;
  }

  @Input() set selectedCompanies(value: number | number[]) {
    this._selectedCompanies = value;

    if (value && typeof value !== 'number' && value.length > 0) {
      this._getCompanies({selectedCompaniesIds: value})
        .pipe(takeUntil(this._unsubscribe$))
        .subscribe((res: any) => {
          this.companiesLoading = false;
          this.selectedCompaniesChange.emit(res);
        }, () => this.companiesLoading = false);
    }
  }

  @Output() selectedCompaniesChange = new EventEmitter();

  companies: any[] = [];
  companiesLoading = false;
  companiesInput$ = new Subject<string>();
  pageCount = 0;

  private _selectedCompanies: number | number[];
  private _companiesSub: Subscription;
  private _companiesCurrentPage = 1;
  private _unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private _statisticsAnalyticsService: StatisticsAnalyticsService) {
  }

  ngOnDestroy(): void {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }

  ngOnInit(): void {
    this._handleCompanies();
  }

  onCompaniesScrollToEnd(): void {
    this._companiesCurrentPage++;
    this._companiesCurrentPage = this._companiesCurrentPage <= this.pageCount ? Math.min(this._companiesCurrentPage, this.pageCount) : 1;
    clearSubscription(this._companiesSub);
    if (this._companiesCurrentPage > 1) {
      this._companiesSub = this._getCompanies()
        .subscribe(() => this.companiesLoading = false, () => this.companiesLoading = false);
    }
  }

  /**
   * Fires event every time company selected
   */
  onSelectedCompaniesChanged(evt: any): void {
    this.selectedCompaniesChange.emit(evt);
  }

  /**
   * Handle companies
   */
  private _handleCompanies(): void {
    this.companiesInput$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => this.companies = []),
        filter(res => !!res),
        switchMap((name: string) => this._getCompanies({name}))
      )
      .subscribe(() => this.companiesLoading = false, () => this.companiesLoading = false);
  }

  /**
   * Retrieves companies by given name
   */
  private _getCompanies(query: any = {}): Observable<any> {
    if (this.countryId) {
      query.countryId = +this.countryId;
    }
    this.companiesLoading = true;
    return this._statisticsAnalyticsService.getCompanies(query, this._companiesCurrentPage)
      .pipe(
        map((res: any) => {
          this.pageCount = res.pageCount;
          this.companies = [...this.companies, ...res.companies];

          return res.companies;
        })
      );
  }

}
