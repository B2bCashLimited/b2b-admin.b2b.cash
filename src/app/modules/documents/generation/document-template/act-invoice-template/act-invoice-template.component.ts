import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CompanyService } from '@b2b/services/company.service';
import { ConfigService } from '@b2b/services/config.service';
import { RequisiteTemplate } from '@b2b/models';

@Component({
  selector: 'b2b-act-invoice-template',
  templateUrl: './act-invoice-template.component.html',
  styleUrls: ['./act-invoice-template.component.scss']
})
export class ActInvoiceTemplateComponent {

  formGroup: FormGroup;
  serverUrl = this._config.serverUrl;
  selectedCountryId: number;
  isRussia = false;
  isEditDocument = false;
  requisiteTemplate: RequisiteTemplate;

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
   * Общие реквизиты
   */
  readonly restFormGroupData: any = {
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
    imgSign: null,
    imgStamp: null,
  };

  readonly dataForActRussian: any = {
    ...this.executorRequisitesRussian,
    ...this.restFormGroupData
  };

  readonly dataForActNotRussian: any = {
    ...this.executorRequisitesNotRussian,
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

  @Input() isAct = false;
  @Input() isInvoice = false;
  @Input() isViewDocument = false;

  @Input() set countryId(value: string) {
    this.selectedCountryId = +value;
    this.isRussia = this.selectedCountryId === 405;

    if (this.selectedCountryId && this.isAct) {
      this._initFormGroup(this.isRussia ? this.dataForActRussian : this.dataForActNotRussian);
    } else if (this.selectedCountryId && this.isInvoice) {
      this._initFormGroup(this.isRussia ? this.dataForInvoiceRussian : this.dataForInvoiceNotRussian);
    }
  }

  @Input() set requisite(value: RequisiteTemplate) {
    this.requisiteTemplate = value;

    if (value) {
      this.isAct = value.type === 1;
      this.isInvoice = value.type === 2;
      this.formGroup.patchValue(value);
    }
  }

  @Output() editDocumentChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private _formBuilder: FormBuilder,
    private _companyService: CompanyService,
    private _config: ConfigService) {
  }

  /**
   * Handles Edit button
   */
  enableEdit(): void {
    this.isEditDocument = true;
    this.isViewDocument = false;
    this.editDocumentChange.emit(true);
  }

  /**
   * Form group initialization
   */
  private _initFormGroup(data: any): void {
    this.formGroup = this._formBuilder.group({...data});
  }

}
