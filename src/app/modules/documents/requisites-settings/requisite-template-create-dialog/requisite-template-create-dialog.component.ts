import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Country, Geolocation, Region, RequisiteTemplate, RequisiteTemplateData } from '@b2b/models';
import { AllowedImageType, removeEmptyProperties } from '@b2b/utils';
import { RequisiteTemplateService } from '@b2b/services/requisite-template.service';
import { FileUploader } from 'ng2-file-upload';
import { UploadService } from '@b2b/services/upload.service';
import { ConfigService } from '@b2b/services/config.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface UploadedImage {
  link: string;
  name: string;
  type: string;
}

@Component({
  selector: 'b2b-requisite-template-create-dialog',
  templateUrl: './requisite-template-create-dialog.component.html',
  styleUrls: ['./requisite-template-create-dialog.component.scss']
})
export class RequisiteTemplateCreateDialogComponent implements OnInit, OnDestroy {

  formGroup: FormGroup;
  selectedCountryId: number;
  selectedRegionId: number;
  isRussia = false;
  isPending = false;
  regions: Region[] = [];
  stampUploader: FileUploader = new FileUploader({});
  signUploader: FileUploader = new FileUploader({});
  allowedImageTypes = AllowedImageType.join(',');
  serverUrl = this._config.serverUrl;
  uploadedStampImage: UploadedImage;
  uploadedSignImage: UploadedImage;
  selectedCountry = 0;
  isEdit = false;
  errorMessage = this.isRussia ? 'Заполните поле' : 'Field is required';

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private _matDialogRef: MatDialogRef<RequisiteTemplateCreateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private _dialogData: {template: RequisiteTemplate},
    private _formBuilder: FormBuilder,
    private _requisiteTemplateService: RequisiteTemplateService,
    private _uploadService: UploadService,
    private _config: ConfigService) {
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this._initFormGroup();
    this._checkIsTemplateEditing();
    this._stampUploadListener();
    this._signUploadListener();
  }

  /**
   * Fires an event every time country selected or cleared
   */
  onCountriesChanged(evt: Country): void {
    this.selectedCountryId = evt && evt.id || null;

    if (this.selectedCountryId) {
      this.isRussia = this.selectedCountryId === 405;
      this.errorMessage = this.isRussia ? 'Заполните поле' : 'Field is required';
      this._updateValidators();
      this.formGroup.reset();
      this.selectedRegionId = null;
      this.uploadedStampImage = null;
      this.uploadedSignImage = null;
      this.formGroup.get('country').setValue(this.selectedCountryId);
      this.formGroup.get('type').setValue(this.isRussia ? 1 : 2);
    } else {
      this.formGroup.reset();
      this.selectedRegionId = null;
    }
  }

  /**
   * Fires an event every time region selected or cleared
   */
  onRegionSelected(evt: Geolocation): void {
    this.selectedRegionId = +evt.id;
  }

  /**
   * Closes dialog
   */
  onCloseClicked(saved = false, data: RequisiteTemplate = null): void {
    this._matDialogRef.close({saved, data});
  }

  /**
   * Submit
   */
  onSubmit(): void {
    if (this.formGroup.valid && !this.isPending) {
      const data: RequisiteTemplateData = this.formGroup.value;
      data.status = 1;
      this.isPending = true;

      if (this.isEdit) {
        this._editRequisiteTemplate(this._dialogData.template.id, data);
      } else {
        this._createRequisiteTemplate(data);
      }
    } else {
      this.formGroup.markAsTouched();
    }
  }

  /**
   * Form group initialization
   */
  private _initFormGroup(): void {
    this.formGroup = this._formBuilder.group({
      name: [null, Validators.required],
      country: [null, Validators.required],
      companyName: [null, Validators.required],
      companyRegion: [null, Validators.required],
      companyCity: [null, Validators.required],
      companyAddress: [null, Validators.required],
      ogrn: null,
      egryul: null,
      inn: null,
      kpp: null,
      oktmo: null,
      okved: null,
      businessLicense: null,
      identityCard: null,
      bankName: [null, Validators.required],
      bankAddress: [null, Validators.required],
      bankAccountNumber: [null, Validators.required],
      bankSwift: null,
      bankInn: null,
      bankKpp: null,
      correspondentAccountNumber: null,
      bik: null,
      intermediaryBankName: null,
      intermediaryBankAddress: null,
      intermediaryBankAccountNumber: null,
      intermediaryBankSwift: null,
      ceo: [null, Validators.required],
      accountant: [null, Validators.required],
      imgStamp: [null, Validators.required],
      imgSign: [null, Validators.required],
      type: [null, Validators.required],
      status: 1
    });
  }

  /**
   * Checks is requisite template is editing or creating new one
   */
  private _checkIsTemplateEditing(): void {
    if (this._dialogData && this._dialogData.template) {
      this.isEdit = true;
      this.selectedCountry = +this._dialogData.template.country.id;
      this.selectedCountryId = this.selectedCountry;
      this.isRussia = this.selectedCountryId === 405;
      this.formGroup.patchValue(this._dialogData.template);
      this.uploadedStampImage = {
        link: this._dialogData.template.imgStamp,
        name: '',
        type: ''
      };
      this.uploadedSignImage = {
        link: this._dialogData.template.imgSign,
        name: '',
        type: ''
      };
    }
  }

  /**
   * Creates new requisite template
   */
  private _createRequisiteTemplate(data: RequisiteTemplateData): void {
    this._requisiteTemplateService.createRequisiteTemplate(removeEmptyProperties(data))
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res: RequisiteTemplate) => {
        this.isPending = false;
        this.onCloseClicked(true, res);
      }, () => this.isPending = false);
  }

  /**
   * Edits existing requisite template
   */
  private _editRequisiteTemplate(templateId: number, data: RequisiteTemplateData): void {
    this._requisiteTemplateService.editRequisiteTemplate(templateId, data)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        this.isPending = false;
        this.onCloseClicked(true, res);
      }, () => this.isPending = false);
  }

  /**
   * Fires an event every time new file added for upload
   */
  private _onFileEmit(fileItem, imageType: string): void {
    const formData = new FormData();
    formData.append('file', fileItem._file);

    if (this.allowedImageTypes.match(fileItem._file.type)) {
      const checkCyrillic = /[а-яА-ЯёЁ]/;
      const fileName = fileItem.file.name;
      let invalidName = false;
      fileName.split('').forEach(letter => checkCyrillic.test(letter) || letter === ' ' ? invalidName = true : null);

      if (invalidName) {
        this._config.showSnackBar$.next({
          message: 'Фотография содержит спецсимволы, кириллицу или пробел. Попробуйте загрузить другой файл',
          action: 'Ошибка',
          duration: 3000
        });
      } else {
        this._uploadImage(formData, imageType);
      }
    } else {
      this._config.showSnackBar$.next({message: 'Формат не поддерживается', action: 'ok', duration: 3000});
    }
  }

  /**
   * Uploads an image
   */
  private _uploadImage(formData: FormData, imageType: string): void {
    this._uploadService.uploadImage(formData)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res: {links: UploadedImage[], message: string}) => {
        if (imageType === 'stamp') {
          this.uploadedStampImage = res.links[0];
          this.formGroup.get('imgStamp').reset();
          this.formGroup.get('imgStamp').setValue(this.uploadedStampImage.link);
        } else if (imageType === 'sign') {
          this.uploadedSignImage = res.links[0];
          this.formGroup.get('imgSign').reset();
          this.formGroup.get('imgSign').setValue(this.uploadedSignImage.link);
        }

        this._config.showSnackBar$.next({message: 'Файл добавлен!', action: 'ok', duration: 3000});
      }, err => {
        this._config.showSnackBar$.next({message: err.detail, action: 'ok', duration: 3000});
      });
  }

  /**
   * Listener for stamp upload
   */
  private _stampUploadListener(): void {
    this.stampUploader.onAfterAddingFile = (fileItem: any) => {
      this._onFileEmit(fileItem, 'stamp');
    };
  }

  /**
   * Listener for sign upload
   */
  private _signUploadListener(): void {
    this.signUploader.onAfterAddingFile = (fileItem: any) => {
      this._onFileEmit(fileItem, 'sign');
    };
  }

  /**
   * Updates some fields' validators due to chosen country
   */
  private _updateValidators(): void {
    this.formGroup.get('ogrn').setValidators(this.isRussia ? Validators.required : null);
    this.formGroup.get('egryul').setValidators(this.isRussia ? Validators.required : null);
    this.formGroup.get('inn').setValidators(this.isRussia ? Validators.required : null);
    this.formGroup.get('kpp').setValidators(this.isRussia ? Validators.required : null);
    this.formGroup.get('oktmo').setValidators(this.isRussia ? Validators.required : null);
    this.formGroup.get('okved').setValidators(this.isRussia ? Validators.required : null);
    this.formGroup.get('businessLicense').setValidators(!this.isRussia ? Validators.required : null);
    this.formGroup.get('identityCard').setValidators(!this.isRussia ? Validators.required : null);
    this.formGroup.get('bankSwift').setValidators(!this.isRussia ? Validators.required : null);
    this.formGroup.get('bankInn').setValidators(this.isRussia ? Validators.required : null);
    this.formGroup.get('bankKpp').setValidators(this.isRussia ? Validators.required : null);
    this.formGroup.get('correspondentAccountNumber').setValidators(this.isRussia ? Validators.required : null);
    this.formGroup.get('bik').setValidators(this.isRussia ? Validators.required : null);
    this.formGroup.get('intermediaryBankName').setValidators(!this.isRussia ? Validators.required : null);
    this.formGroup.get('intermediaryBankAddress').setValidators(!this.isRussia ? Validators.required : null);
    this.formGroup.get('intermediaryBankAccountNumber').setValidators(!this.isRussia ? Validators.required : null);
    this.formGroup.get('intermediaryBankSwift').setValidators(!this.isRussia ? Validators.required : null);
    this.formGroup.updateValueAndValidity();
  }

}
