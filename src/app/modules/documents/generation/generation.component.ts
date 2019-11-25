import { Component, OnDestroy, OnInit } from '@angular/core';
import { Country, RequisiteTemplate } from '@b2b/models';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';
import { clearSubscription } from '@b2b/decorators';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { PageEvent } from '@angular/material';
import { RequisiteTemplateService } from '@b2b/services/requisite-template.service';

@Component({
  selector: 'b2b-generation',
  templateUrl: './generation.component.html',
  styleUrls: ['./generation.component.scss']
})
export class GenerationComponent implements OnInit, OnDestroy {

  displayedColumns: string[] = [
    'number', 'document-type', 'document-template', 'country', 'flag', 'action'
  ];

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

  formGroup: FormGroup;
  isLoading = false;
  requisites: RequisiteTemplate[] = [];
  totalItems = 0;
  pageIndex = 0;
  pageCount = 0;
  pageSize = 25;

  private _currentPage = 1;
  private _pageSub: Subscription;

  constructor(private _formBuilder: FormBuilder,
              private _requisiteTemplateService: RequisiteTemplateService) {
  }

  ngOnDestroy(): void {
  }

  ngOnInit(): void {
    this._initFormGroup();

    this.formGroup.valueChanges
      .pipe(
        startWith(this.formGroup.value),
        distinctUntilChanged(),
        debounceTime(300),
        switchMap(() => this._getRequisites())
      )
      .subscribe(() => this.isLoading = false, () => this.isLoading = false);
  }

  /**
   * Fires an event every time country changed
   */
  onCountriesChanged(evt: Country): void {
    this.formGroup.get('countryId').setValue(evt && evt.id || null);
  }

  /**
   * Fires an event every time page changed
   */
  onPageChanged(evt: PageEvent): void {
    const pageIndex = evt.pageIndex + 1;
    this._currentPage = pageIndex <= this.pageCount ? Math.min(pageIndex, this.pageCount) : 1;
    clearSubscription(this._pageSub);
    this._pageSub = this._getRequisites()
      .subscribe(() => this.isLoading = false, () => this.isLoading = false);
  }

  /**
   * Form group initialization
   */
  private _initFormGroup(): void {
    this.formGroup = this._formBuilder.group({
      countryId: null,
      documentType: 0
    });
  }

  /**
   * Retrieves requisites by given filters
   */
  private _getRequisites(): Observable<any> {
    this.isLoading = true;

    return forkJoin(
      this._requisiteTemplateService.getRequisiteTemplates({isAct: true}),
      this._requisiteTemplateService.getRequisiteTemplates({isInvoice: true})
    )
      .pipe(
        map((res: any[]) => {
          this.totalItems = res[0].totalItems;
          this.pageSize = res[0].pageSize;
          this.pageCount = res[0].pageCount;
          this.requisites = [...res[0].requisites, ...res[1].requisites];
        })
      );
  }

}
