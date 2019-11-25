import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, PageEvent } from '@angular/material';
import { RequisitesTemplateDeleteDialogComponent } from './requisites-template-delete-dialog/requisites-template-delete-dialog.component';
import { RequisiteTemplateCreateDialogComponent } from './requisite-template-create-dialog/requisite-template-create-dialog.component';
import { RequisiteTemplateService } from '@b2b/services/requisite-template.service';
import { Country, RequisiteTemplate } from '@b2b/models';
import { debounceTime, distinctUntilChanged, filter, first, switchMap, takeUntil } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';

@Component({
  selector: 'b2b-requisites-settings',
  templateUrl: './requisites-settings.component.html',
  styleUrls: ['./requisites-settings.component.scss']
})
export class RequisitesSettingsComponent implements OnInit, OnDestroy {

  displayedColumns: string[] = ['number', 'title', 'country', 'flag', 'action'];
  isLoading = false;
  selectedCountryId: number;
  requisiteTemplateName = new FormControl();
  requisiteTemplates: RequisiteTemplate[] = [];
  pageCount = 0;
  pageSize = 0;
  pageIndex = 0;
  length = 0;

  private _currentPage = 1;
  private _unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private _dialog: MatDialog,
              private _requisiteTemplateService: RequisiteTemplateService) {
  }

  ngOnDestroy(): void {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.getRequisiteTemplates();
    this._handleRequisiteTemplateName();
  }

  /**
   * Retrieves all or by filter requisite templates
   */
  getRequisiteTemplates(): void {
    const query: any = {
      country: this.selectedCountryId,
      name: this.requisiteTemplateName.value
    };
    this.isLoading = true;

    this._requisiteTemplateService.getRequisiteTemplates(query, this._currentPage)
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe((res: any) => {
        this.isLoading = false;
        this.pageSize = res.pageSize;
        this.pageCount = res.pageCount;
        this.pageIndex = res.page - 1;
        this.length = res.pageCount * res.pageSize;
        this.requisiteTemplates = res.requisites;
      }, () => this.isLoading = false);
  }

  /**
   * Fires event every time country selected
   */
  onCountriesChanged(evt: Country): void {
    this.selectedCountryId = evt && evt.id || null;
    this.getRequisiteTemplates();
  }

  /**
   * Opens dialog to create or edit requisite template
   */
  openCreateOrEditTemplateDialog(template: RequisiteTemplate = null): void {
    this._dialog.open(RequisiteTemplateCreateDialogComponent, {
      disableClose: true,
      data: {template}
    }).afterClosed()
      .pipe(
        first(),
        filter(res => !!res && res.saved)
      )
      .subscribe((res: any) => {
        this.requisiteTemplates = this.requisiteTemplates.filter(item => +item.id !== +res.data.id);
        this.requisiteTemplates = [res.data, ...this.requisiteTemplates];
      });
  }

  /**
   * Opens dialog to confirm requisite template deletion
   */
  openDeleteRequisiteConfirmDialog(templateId: number): void {
    this._dialog.open(RequisitesTemplateDeleteDialogComponent, {
      width: '400px',
      disableClose: true
    }).afterClosed()
      .pipe(
        filter(res => res && !!res),
        switchMap(() => {
          this.isLoading = true;
          return this._requisiteTemplateService.deleteRequisiteTemplate(templateId);
        })
      )
      .subscribe(() => {
        this.isLoading = false;
        this.requisiteTemplates = this.requisiteTemplates.filter(template => template.id !== templateId);
      }, () => this.isLoading = false);
  }

  /**
   * Fires en event every time page changed
   */
  onPageChanged(pageEvent: PageEvent): void {
    const pageIndex = pageEvent.pageIndex + 1;
    this._currentPage = pageIndex <= this.pageCount ? Math.min(pageIndex, this.pageCount) : 1;

    if (this._currentPage > 1) {
      this.getRequisiteTemplates();
    }
  }

  /**
   * Handles requisite template name
   */
  private _handleRequisiteTemplateName(): void {
    this.requisiteTemplateName.valueChanges
      .pipe(
        distinctUntilChanged(),
        debounceTime(300),
        takeUntil(this._unsubscribe$)
      )
      .subscribe(() => this.getRequisiteTemplates());
  }

}
