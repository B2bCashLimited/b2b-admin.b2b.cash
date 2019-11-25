import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConfigService } from '@b2b/services/config.service';
import { Invoice, RequisiteTemplate } from '@b2b/models';
import { ActivatedRoute, Router } from '@angular/router';
import { InvoicesService } from '@b2b/services/invoices.service';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CompanyService } from '@b2b/services/company.service';

@Component({
  selector: 'b2b-act-invoice-template',
  templateUrl: './act-invoice-template.component.html',
  styleUrls: ['./act-invoice-template.component.scss']
})
export class ActInvoiceTemplateComponent implements OnInit, OnDestroy {

  formGroup: FormGroup;
  serverUrl = this._config.serverUrl;
  invoiceId = this._route.snapshot.params.id;
  requisiteTemplate: RequisiteTemplate;
  invoice: Invoice;
  isRussia = false;
  isLoading = false;
  isAct = false;
  isInvoice = false;
  currency: string;
  queryParams: any = this._route.snapshot.queryParams;

  /**
   * Реквизиты исполнителя для России
   */
  readonly executorRequisitesRussian: any = {
    ogrn: null,
    egryul: null,
    inn: null,
    kpp: null,
    oktmo: null,
    okved: null,
    bankInn: null,
    bankKpp: null,
    correspondentAccountNumber: null,
    bik: null,
  };

  /**
   * Реквизиты исполнителя для остальных стран
   */
  readonly executorRequisitesNotRussian: any = {
    businessLicense: null,
    identityCard: null,
    bankSwift: null,
    intermediaryBankName: null,
    intermediaryBankAddress: null,
    intermediaryBankAccountNumber: null,
    intermediaryBankSwift: null,
  };

  /**
   * Реквизиты заказчика для России
   */
  readonly customerRequisitesRussian: any = {
    taxLicense: null,
    letterConsignment: null,
    certificateOrganizationCode: null,
    registracionVED: null,
    IIN: null,
    customerBankKpp: null,
    accountHolder: null,
    BIK: null,
  };

  /**
   * Реквизиты заказчика для остальных стран
   */
  readonly customerRequisitesNotRussian: any = {
    customerBankSwift: null,
    customerIntermediaryBankName: null,
    customerIntermediaryBankAddress: null,
    customerIntermediaryBankAccountNumber: null,
    customerIntermediaryBankSwift: null,
  };

  /**
   * Общие реквизиты
   */
  readonly restFormGroupData: any = {
    ceo: null,
    companyName: null,
    companyAddress: null,
    nameRu: null,
    nameEn: null,
    address: null,
    businesLicense: null,
    identicalCard: null,
    bankName: null,
    bankAddress: null,
    bankAccountNumber: null,
    customerBankName: null,
    customerBankAddress: null,
    price: null,
    RS: null,
    imgSign: null,
    imgStamp: null,
  };

  readonly dataForActRussian: any = {
    ...this.executorRequisitesRussian,
    ...this.customerRequisitesRussian,
    ...this.restFormGroupData
  };

  readonly dataForActNotRussian: any = {
    ...this.executorRequisitesNotRussian,
    ...this.customerRequisitesNotRussian,
    ...this.restFormGroupData
  };

  readonly dataForInvoiceRussian: any = {
    ...this.executorRequisitesRussian,
    ...this.restFormGroupData
  };

  readonly dataForInvoiceNotRussian: any = {
    ...this.executorRequisitesNotRussian,
    ...this.restFormGroupData
  };

  constructor(
    private _formBuilder: FormBuilder,
    private _config: ConfigService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _invoicesService: InvoicesService,
    private _companyService: CompanyService) {
  }

  ngOnDestroy(): void {
  }

  ngOnInit(): void {
    this._getInvoiceById(this.invoiceId);
  }

  /**
   * Form group initialization
   */
  private _initFormGroup(data: any): void {
    this.formGroup = this._formBuilder.group({...data});
  }

  /**
   * Retrieves invoice by id
   */
  private _getInvoiceById(id: string): void {
    this.isLoading = true;

    this._invoicesService.getInvoices({id})
      .pipe(
        switchMap((res: any) => {
          const invoice: Invoice = res.invoices[0];

          if (res && res.invoices.length > 0) {
            this.invoice = invoice;
            this.isRussia = invoice.country.id === 405;
            this.isAct = invoice.document.type === 1;
            this.isInvoice = invoice.document.type === 2 || invoice.document.type === 3;
            this.currency = invoice.currency && invoice.currency.nameRu || '';

            if (this.isAct) {
              this._initFormGroup(this.isRussia ? this.dataForActRussian : this.dataForActNotRussian);
            } else if (this.isInvoice) {
              this._initFormGroup(this.isRussia ? this.dataForInvoiceRussian : this.dataForInvoiceNotRussian);
            }

            if (invoice.requisites) {
              this.formGroup.patchValue(invoice.requisites);
            }

            this.formGroup.patchValue(invoice);
            return this._getCompany(invoice.company.id);
          } else {
            this._router.navigate(['/documents/list'], {queryParams: this.queryParams});
          }
        })
      )
      .subscribe(() => this.isLoading = false, () => this.isLoading = false);
  }

  /**
   * Retrieves company by given id
   */
  private _getCompany(companyId: string): Observable<any> {
    return this._companyService.getCompanyById(companyId)
      .pipe(
        map((res: any) => {
          if (res && Object.keys(res).length > 0 && this.isAct) {
            if (this.isRussia) {
              this.formGroup.patchValue(res.companyDetails);
              this.formGroup.patchValue(res.companyDetails.bank);
              this.formGroup.get('nameRu').setValue(res.name);
              this.formGroup.get('address').setValue(res.legalAddress.geoObject.address);
              this.formGroup.get('customerBankName').setValue(res.companyDetails.bank.name);
              this.formGroup.get('customerBankAddress').setValue(res.companyDetails.bank.address);
            } else {
              const swift = res.companyDetailsEn && res.companyDetailsEn.bank && res.companyDetailsEn.bank.BIK
                || res.companyDetailsCn && res.companyDetailsCn.bank && res.companyDetailsCn.bank.BIK || null;
              const intermediaryBankName = res.companyDetailsEn && res.companyDetailsEn.bankInt && res.companyDetailsEn.bankInt.name
                || res.companyDetailsCn && res.companyDetailsCn.bankInt && res.companyDetailsCn.bankInt.name || null;
              const intermediaryBankAddress = res.companyDetailsEn && res.companyDetailsEn.bankInt && res.companyDetailsEn.bankInt.address
                || res.companyDetailsCn && res.companyDetailsCn.bankInt && res.companyDetailsCn.bankInt.address || null;
              const intermediaryBankAccountNumber = res.companyDetailsEn && res.companyDetailsEn.bankInt && res.companyDetailsEn.bankInt.RS
                || res.companyDetailsCn && res.companyDetailsCn.bankInt && res.companyDetailsCn.bankInt.RS || null;
              const intermediaryBankSwift = res.companyDetailsEn && res.companyDetailsEn.bankInt && res.companyDetailsEn.bankInt.BIK ||
                res.companyDetailsCn && res.companyDetailsCn.bankInt && res.companyDetailsCn.bankInt.BIK || null;
              this.formGroup.patchValue(res.companyDetailsEn);
              this.formGroup.patchValue(res.companyDetailsEn.bank);
              this.formGroup.get('nameEn').setValue(res.nameEn);
              this.formGroup.get('address').setValue(res.legalAddress.geoObject.address);
              this.formGroup.get('customerBankName').setValue(res.companyDetailsEn.bank.name);
              this.formGroup.get('customerBankAddress').setValue(res.companyDetailsEn.bank.address);
              this.formGroup.get('customerBankSwift').setValue(swift);
              this.formGroup.get('customerIntermediaryBankName').setValue(intermediaryBankName);
              this.formGroup.get('customerIntermediaryBankAddress').setValue(intermediaryBankAddress);
              this.formGroup.get('customerIntermediaryBankAccountNumber').setValue(intermediaryBankAccountNumber);
              this.formGroup.get('customerIntermediaryBankSwift').setValue(intermediaryBankSwift);
            }
          }
        })
      );
  }

}
