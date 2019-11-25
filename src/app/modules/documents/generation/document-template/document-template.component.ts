import { Component, OnDestroy, OnInit } from '@angular/core';
import { InvoicesService } from '@b2b/services/invoices.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Country, RequisiteTemplate } from '@b2b/models';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RequisiteTemplateService } from '@b2b/services/requisite-template.service';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { removeEmptyProperties } from '@b2b/utils';

@Component({
  selector: 'b2b-document-template',
  templateUrl: './document-template.component.html',
  styleUrls: ['./document-template.component.scss']
})
export class DocumentTemplateComponent implements OnInit, OnDestroy {

  formGroup: FormGroup;
  currencies$: Observable<any[]>;
  isNewDocument = false;
  isViewDocument = false;
  requisiteTemplate: RequisiteTemplate;
  isAct = false;
  isInvoice = false;
  isLoading = false;
  requisiteId = this._route.snapshot.params.id;
  isCountryDisabled = false;
  isRequisitesDisabled = true;
  resetRequisites = false;
  isRussia = false;
  selectedCountry: Country;
  isPending = false;
  selectedRequisiteId: number;
  isEditDocument = false;

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private _invoicesService: InvoicesService,
    private _requisiteTemplateService: RequisiteTemplateService,
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _route: ActivatedRoute
  ) {
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this._initFormGroup();
    this._getCurrencies();

    if (this._router.url.includes('new-act')) {
      this.isAct = true;
      this.isNewDocument = true;
    } else if (this._router.url.includes('new-invoice')) {
      this.isInvoice = true;
      this.isNewDocument = true;
    } else if (this.requisiteId) {
      this.isViewDocument = true;
      this.isCountryDisabled = true;
      this.isRequisitesDisabled = true;
      this.formGroup.get('templateName').disable();
      this._getRequisiteById()
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(() => this.isLoading = false, () => this.isLoading = false);
    }

    this._handleCountries();
  }

  /**
   * Fires an event every time country changed
   */
  onCountriesChanged(evt: Country): void {
    this.selectedCountry = evt;
    this.resetRequisites = true;
    this.requisiteTemplate = null;
    this.isRussia = evt && evt.id === 405;
    this.formGroup.get('country').setValue(evt && evt.id || null);

    if (evt && Object.keys(evt).length > 0) {
      this.formGroup.get('templateName').enable();
    } else {
      this.formGroup.get('templateName').disable();
    }
  }

  /**
   * Fires event every time requisite changed
   */
  onSelectedRequisiteChanged(evt: RequisiteTemplate): void {
    this.requisiteTemplate = evt;
    this.formGroup.get('requisite').setValue(evt && evt.id || null);

    if (evt && Object.keys(evt).length > 0) {
      this.formGroup.get('templateName').enable();
    } else {
      this.isRussia = false;
      this.selectedCountry = null;
      this.formGroup.get('country').reset();
      this.formGroup.get('templateName').reset();
      this.formGroup.get('templateName').disable();
    }
  }

  /**
   * Creates new document
   */
  onSubmit(): void {
    if (this.formGroup.valid && !this.isPending) {
      this.isPending = true;

      const data: any = this.formGroup.value;
      data.templateName = null;

      if (this.isAct) {
        data.type = 1;
      } else if (this.isInvoice) {
        data.type = 2;
      }

      this._createEditDocument(removeEmptyProperties(data));
    }
  }

  /**
   * Fires event on Edit button clicked
   */
  onEditDocumentChanged(evt: boolean): void {
    this.isEditDocument = evt;
    if (evt) {
      this.isViewDocument = false;
      this.isCountryDisabled = false;
      this.isRequisitesDisabled = false;
      this.formGroup.get('templateName').enable();
    }
  }

  /**
   * Form group initialization
   */
  private _initFormGroup(): void {
    this.formGroup = this._formBuilder.group({
      country: [null, Validators.required],
      templateName: {value: null, disabled: true},
      requisite: [null, Validators.required],
      type: null,
    });
  }

  /**
   * Creates or edits document
   */
  private _createEditDocument(data: any): void {
    if (this.isNewDocument) {
      this._requisiteTemplateService.setRequisite(data)
        .subscribe(() => {
          this._router.navigate(['/documents/generation']);
          this.isPending = false;
        }, () => this.isPending = false);
    } else {
      this._requisiteTemplateService.updateRequisite(data, this.requisiteId)
        .subscribe(() => {
          this._router.navigate(['/documents/generation']);
          this.isPending = false;
        }, () => this.isPending = false);
    }
  }

  /**
   * Retrieves currencies
   */
  private _getCurrencies(): void {
    this.currencies$ = this._invoicesService.getCurrencies();
  }

  /**
   * Retrieves requisite by given id
   */
  private _getRequisiteById(): Observable<any> {
    this.isLoading = true;

    return this._requisiteTemplateService.getRequisiteById(this.requisiteId)
      .pipe(
        map((res: RequisiteTemplate) => {
          if (res && Object.keys(res).length > 0) {
            this.isAct = res.type === 1;
            this.isInvoice = res.type === 2 || res.type === 3;
            this.formGroup.get('country').setValue(res.country.id);
            this.selectedCountry = res.country;
            this.formGroup.get('requisite').setValue(res.id);
            this.selectedRequisiteId = res.id;
            this.requisiteTemplate = res;
          } else {
            this._router.navigate(['/documents/generation']);
          }
        })
      );
  }

  /**
   * Handles countries changes
   */
  private _handleCountries(): void {
    this.formGroup.get('country').valueChanges
      .pipe(
        distinctUntilChanged(),
        debounceTime(300),
        map(res => {
          if (!this.isViewDocument) {
            this.isRequisitesDisabled = !res;
            this.resetRequisites = true;
          }
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe();
  }

}
