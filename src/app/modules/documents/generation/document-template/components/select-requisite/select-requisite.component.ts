import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { RequisiteTemplate } from '@b2b/models';
import { debounceTime, distinctUntilChanged, map, takeUntil, tap } from 'rxjs/operators';
import { RequisiteTemplateService } from '@b2b/services/requisite-template.service';
import { clearSubscription } from '@b2b/decorators';
import { NoRequisitesComponent } from '../../../dialogs/no-requisites/no-requisites.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'b2b-select-requisite',
  templateUrl: './select-requisite.component.html',
  styleUrls: ['./select-requisite.component.scss']
})
export class SelectRequisiteComponent implements OnDestroy {

  isLoading = false;
  requisiteInput$ = new Subject();
  requisites: RequisiteTemplate[] = [];
  pageCount = 0;

  @Input() disabled = false;
  @Input() selectedRequisiteId: number;
  @Input() selectedCountryName: string;

  @Input() set reset(value: boolean) {
    if (value) {
      this.selectedRequisiteId = null;
    }
  }

  @Input() set countryId(value: number) {
    if (value) {
      this._countryId = value;
      this._getRequisiteTemplates()
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(() => this.isLoading = false, () => this.isLoading = false);
    } else {
      this.selectedRequisiteId = null;
    }
  }

  @Input() set templateName(value: Observable<any>) {
    value
      .pipe(
        distinctUntilChanged(),
        debounceTime(300),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((res: string) => {
        this._templateName = res;

        if (this._templateName) {
          clearSubscription(this._requisitesSub);
          this._requisitesSub = this._getRequisiteTemplates()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() => this.isLoading = false, () => this.isLoading = false);
        }
      });
  }

  @Output() selectedRequisiteChanged: EventEmitter<any> = new EventEmitter<any>();

  private _currentPage = 1;
  private _countryId: number;
  private _templateName: string;

  private _requisitesSub: Subscription;
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private _requisiteTemplateService: RequisiteTemplateService,
    private _matDialog: MatDialog
  ) {
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  /**
   * Fires an event every time requisite changed
   */
  onSelectedRequisiteChanged(evt: RequisiteTemplate): void {
    this.selectedRequisiteChanged.emit(evt);
  }

  /**
   * Fires every time requisites list scrolls
   */
  onRequisitesScrollToEnd(): void {
    this._currentPage++;
    this._currentPage = this._currentPage <= this.pageCount ? Math.min(this._currentPage, this.pageCount) : 1;
    clearSubscription(this._requisitesSub);
    this._requisitesSub = this._getRequisiteTemplates()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.isLoading = false, () => this.isLoading = false);
  }

  /**
   * Retrieves all or by filter requisite templates
   */
  private _getRequisiteTemplates(): Observable<any> {
    const query: any = {
      country: this._countryId,
      name: this._templateName
    };

    return this._requisiteTemplateService.getRequisiteTemplates(query, this._currentPage)
      .pipe(
        tap(() => this.requisites = []),
        map((res: any) => {
          this.pageCount = res.pageCount;

          if (!res.requisites || res.requisites.length === 0) {
            this._matDialog.closeAll();
            this._openNoRequisitesDialog();
            this.disabled = true;
            this.selectedRequisiteChanged.emit();
          } else {
            this.requisites = [...this.requisites, ...res.requisites];
          }
        })
      );
  }

  /**
   * Opens dialog if no requisites found for selected country
   */
  private _openNoRequisitesDialog(): void {
    this._matDialog.open(NoRequisitesComponent, {
      data: {
        country: this.selectedCountryName || ''
      }
    });

    this.selectedRequisiteId = null;
    this.isLoading = false;
  }

}
