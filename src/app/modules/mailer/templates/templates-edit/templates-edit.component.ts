import {Component, EventEmitter, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {MailerService} from '../../mailer.service';
import {map} from 'rxjs/operators';
import {forkJoin, Subscription} from 'rxjs';
import {FormBuilder, FormGroup, Validators, AbstractControl} from '@angular/forms';
import {UploadFile, UploadInput, UploadOutput, UploadStatus} from 'ngx-uploader';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {AuthToken} from '@b2b/models';
import {getFromLocalStorage} from '@b2b/utils';
import {ConfigService} from '@b2b/services/config.service';
import {clearSubscription, ClearSubscriptions} from '@b2b/decorators';
import {MailerTextAreaComponent} from './components/mailer-text-area/mailer-text-area.component';

@ClearSubscriptions()
@Component({
  selector: 'b2b-templates-edit',
  templateUrl: './templates-edit.component.html',
  styleUrls: ['./templates-edit.component.scss']
})
export class TemplatesEditComponent implements OnDestroy, OnInit {
  @ViewChild('mailerTextArea') mailerTextArea: MailerTextAreaComponent;

  files: UploadFile[] = [];
  formGroup: FormGroup;
  options = {concurrency: 1, maxUploads: 3};
  safeTemplate: SafeHtml;
  template: any;
  uploadInput = new EventEmitter<UploadInput>();

  private _dragOver = false;
  private _sub: Subscription;
  private _templateSub: Subscription;

  constructor(
    private _route: ActivatedRoute,
    private _config: ConfigService,
    private _mailerService: MailerService,
    private _formBuilder: FormBuilder,
    private _domSanitizer: DomSanitizer) {
  }

  ngOnDestroy(): void {
    // @ClearSubscriptions()
  }

  ngOnInit(): void {
    this.formGroup = this._formBuilder.group({
      text: [null, [Validators.required]],
      name: null,
      subject: null,
      template: null,
      clientType: this._formBuilder.group({
        buyer: false,
        seller: false
      }, {validator: oneIsRequired})
    });
    const {templateId} = this._route.snapshot.params;
    this._sub = this._mailerService
      .getHtmlTemplateById(templateId)
      .subscribe((res: any) => {
        this.template = res;
        const type = this.template.clientType;
        this.template.clientType = {
          buyer: false,
          seller: false,
        };
        this.template.clientType.buyer = type === 3 || type === 1;
        this.template.clientType.seller = type === 3 || type === 2;
        this.formGroup.patchValue(this.template);
      });
    this._templateSub = this.formGroup.get('template').valueChanges
      .subscribe((res: string) => {
        res = (res || '').replace(/{\$siteUrl}/g, this._config.frontUrl);
        this.safeTemplate = this._domSanitizer.bypassSecurityTrustHtml(res);
        setTimeout(() => {
          const content = document.querySelector(`#text-mail-content`);
          if (content && content.innerHTML) {
            this.formGroup.get('text').patchValue(content.innerHTML);
            content.innerHTML = '';
            content.appendChild(this.mailerTextArea.element);
          }
        }, 100);
      });


    this.formGroup.get('text').valueChanges
      .subscribe((content: string) => {
        this.mailerTextArea.mailText = content;
      });
  }

  onDestroyFileClick(fileId: number): void {
    this.template.htmlTemplateFiles = this.template.htmlTemplateFiles
      .filter(file => file.id !== fileId);
  }

  onUploadOutput(output: UploadOutput): void {
    if (output.type === 'allAddedToQueue') {
      const auth: AuthToken = getFromLocalStorage('B2B_TOKEN');
      const event: UploadInput = {
        type: 'uploadAll',
        url: `${this._config.apiUrl}/upload/file`,
        method: 'POST',
        headers: {'Authorization': `${auth.token_type} ${auth.access_token}`},
        data: {type: '3'}
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
      this._dragOver = true;
    } else if (output.type === 'dragOut') {
      this._dragOver = false;
    } else if (output.type === 'drop') {
      this._dragOver = false;
    } else if (output.type === 'done') {
    }

    this.files.forEach((file: UploadFile) => {
      if (file.progress.status === 2) {
        this.template.htmlTemplateFiles.push(file.response);
      }
    });

    this.files = this.files.filter(file => file.progress.status !== UploadStatus.Done);
  }

  onSaveTemplateClick(): void {
    const div = document.createElement('div');
    div.innerHTML = this.formGroup.get('template').value;
    const content = div.querySelector(`#text-mail-content`);
    content.innerHTML = this.formGroup.get('text').value;

    const re = new RegExp(this._config.frontUrl, 'g');
    const body = {
      ...this.formGroup.value,
      template: div.innerHTML.replace(re, '{$siteUrl}'),
      clientType: this.getClientType(),
      htmlTemplateFiles: (this.template.htmlTemplateFiles || []).map(file => file.id),
      userType: this.template.userType,
    };
    this._mailerService.updateHtmlTemplate(this.template.id, body).subscribe();
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
