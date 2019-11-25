import { Component, EventEmitter, OnInit } from '@angular/core';
import { UploadFile, UploadInput, UploadOutput, UploadStatus } from 'ngx-uploader';
import { FormBuilder, FormGroup, ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfigService } from '@b2b/services/config.service';
import { MailerService } from '../../mailer.service';
import { AuthToken } from '@b2b/models';
import { getFromLocalStorage } from '@b2b/utils';
import { map } from 'rxjs/operators';

@Component({
  selector: 'b2b-templates-new',
  templateUrl: './templates-new.component.html',
  styleUrls: ['./templates-new.component.scss']
})
export class TemplatesNewComponent implements OnInit {
  files: UploadFile[] = [];
  formGroup: FormGroup;
  length = 0;
  options = { concurrency: 1, maxUploads: 3 };
  pageCount = 0;
  pageSize = 0;
  safeTemplate: SafeHtml;
  senders: any = [];
  uploadInput = new EventEmitter<UploadInput>();
  htmlTemplateFiles: any[] = [];

  private dragOver = false;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _config: ConfigService,
    private _mailerService: MailerService,
    private _formBuilder: FormBuilder,
    private _domSanitizer: DomSanitizer) {
  }

  ngOnInit() {
    this.formGroup = this._formBuilder.group({
      name: null,
      subject: null,
      senderEmail: null,
      template: null,
      clientType: this._formBuilder.group({
        buyer: false,
        seller: false
      }, {validator: oneIsRequired})
    });

    this.formGroup.get('template').valueChanges
      .subscribe((res: string) => {
        const template = (res || '').replace(/{\$siteUrl}/g, location.origin);
        this.safeTemplate = this._domSanitizer.bypassSecurityTrustHtml(template);
      });
  }

  onDestroyFileClick(fileId: number): void {
    this.htmlTemplateFiles = this.htmlTemplateFiles
      .filter(file => file.id !== fileId);
  }

  onUploadOutput(output: UploadOutput): void {
    if (output.type === 'allAddedToQueue') {
      const auth: AuthToken = getFromLocalStorage('B2B_TOKEN');
      const event: UploadInput = {
        type: 'uploadAll',
        url: `${this._config.apiUrl}/upload/file`,
        method: 'POST',
        headers: { 'Authorization': `${auth.token_type} ${auth.access_token}` },
        data: { type: '3' }
      };
      this.uploadInput.emit(event);
    } else if (output.type === 'addedToQueue' && typeof output.file !== 'undefined') {
      this.files.push(output.file);
    } else if (output.type === 'uploading' && typeof output.file !== 'undefined') {
      const index = this.files.findIndex(file => file.id === output.file.id);
      this.files[index] = output.file;
    } else if (output.type === 'removed') {
      this.files = this.files.filter(file => file !== output.file);
    } else if (output.type === 'dragOver') {
      this.dragOver = true;
    } else if (output.type === 'dragOut') {
      this.dragOver = false;
    } else if (output.type === 'drop') {
      this.dragOver = false;
    } else if (output.type === 'done') {
    }

    this.files.forEach((file: UploadFile) => {
      if (file.progress.status === 2) {
        this.htmlTemplateFiles.push(file.response);
      }
    });

    this.files = this.files.filter(file => file.progress.status !== UploadStatus.Done);
  }

  onSaveTemplateClick(): void {
    const body = {
      ...this.formGroup.value,
      clientType: this.getClientType(),
      htmlTemplateFiles: (this.htmlTemplateFiles || []).map(file => file.id),
      userType: 0,
    };
    this._mailerService.createHtmlTemplate(body)
      .subscribe(() => {
        this._router.navigate(['mailer/templates']);
      });
  }

  getClientType(): number {
    let type = 0;
    const val = this.formGroup.get('clientType').value;
    if (val.buyer && val.seller) {
      type = 3;
    } else {
      if (val.buyer) {
        type = 1;
      } else if (val.seller) {
        type = 2;
      }
    }
    return type;
  }

}

const oneIsRequired = (control: AbstractControl): {[key: string]: boolean} => {
  const buyer = control.get('buyer');
  const seller = control.get('seller');
  if (!buyer || !seller) {
    return null;
  }
  return buyer.value || seller.value ? null : { oneIsRequired: true };
};
