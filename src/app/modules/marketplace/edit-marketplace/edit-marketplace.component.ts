import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MarketplaceService } from '@b2b/services/marketplace.service';
import { UploadService } from '@b2b/services/upload.service';
import { FileUploader } from 'ng2-file-upload';
import { AllowedImageType, removeEmptyProperties } from '@b2b/utils';
import { ConfigService } from '@b2b/services/config.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { SaveMarket } from '@b2b/models/save-market';
import { Router, ActivatedRoute } from '@angular/router';

interface UploadedImage {
  link: string;
  name: string;
  type: string;
}

@Component({
  selector: 'b2b-edit-marketplace',
  templateUrl: './edit-marketplace.component.html',
  styleUrls: ['./edit-marketplace.component.scss']
})

export class EditMarketplaceComponent implements OnInit {

  editedMarket: any;
  formTech: FormGroup;
  formVisual: FormGroup;
  needHelp = true;
  textColor: any;
  linkColor: any;
  buttonHoverColor: any;
  buttonColor: any;
  buttonTextColor: any;
  showMarketTechProps: any;
  showMarketVisualProps: any;
  marketName: string;
  serverUrl = this._config.serverUrl;
  srcResult: any;
  baner1360Array: any[] = [];
  baner984Array: any[] = [];
  baner728Array: any[] = [];
  baner280Array: any[] = [];
  logoImg: any;
  faviconImg: any;
  uploadedlogoImage: UploadedImage;
  uploadedfaviconImage: UploadedImage;
  banerUploader1360Image: UploadedImage;
  banerUploader984Image: UploadedImage;
  banerUploader728Image: UploadedImage;
  banerUploader280Image: UploadedImage;
  faviconUploader: FileUploader = new FileUploader({});
  logoUploader: FileUploader = new FileUploader({});
  banerUploader1360: FileUploader = new FileUploader({});
  banerUploader984: FileUploader = new FileUploader({});
  banerUploader728: FileUploader = new FileUploader({});
  banerUploader280: FileUploader = new FileUploader({});
  allowedImageTypes = AllowedImageType.join(',');
  private unsubscribe$: Subject<void> = new Subject<void>();

  tabLinks = [
    {
      url: 'compose', label: 'Техническая часть',
    },
    {
      url: 'templates', label: 'Визуальная часть',
    }
  ];

  constructor(public fb: FormBuilder, private marketServeice: MarketplaceService,
    private _config: ConfigService,
    private _uploadService: UploadService,
    private marketService: MarketplaceService,
    private router: ActivatedRoute,
    private rout: Router
      ) {
    this.formTech = this.fb.group({
      marketName: ['', Validators.required],
      domen: ['', Validators.required],
      email: ['', Validators.required],
      senderName: ['', Validators.required]
    });
    this.formVisual = this.fb.group({
      logo: ['', Validators.required],
      favicon: ['', Validators.required],
      imglogo: [null, Validators.required],
      imgfavicon: [null, Validators.required],
      imgBaner1360: [null, Validators.required],
      imgBaner984: [null, Validators.required],
      imgBaner728: [null, Validators.required],
      imgBaner280: [null, Validators.required],
    });
   }

  ngOnInit() {
    this.router.data.subscribe(params => {
      this.editedMarket = params.countryDetail;
      this.marketName = this.editedMarket.name;
      this.showMarketTechProps = {
        marketName: this.editedMarket.name,
        domen: this.editedMarket.description,
        email: this.shortMail(this.editedMarket.siteEmails),
        senderName: this.editedMarket.fullName
      };
      this.showMarketVisualProps = {
        logo: this.editedMarket.structure.images.logo,
        favicon: this.editedMarket.structure.images.favicon,
        imglogo: this.editedMarket.structure.images.imglogo,
        imgfavicon: this.editedMarket.structure.images.imgfavicon,
        imgBaner1360: this.editedMarket.structure.images.baner1360,
        imgBaner984: this.editedMarket.structure.images.baner984,
        imgBaner728: this.editedMarket.structure.images.baner728,
        imgBaner280: this.editedMarket.structure.images.baner280
      };
      this.logoImg = this.editedMarket.structure.images.logo;
      this.faviconImg = this.editedMarket.structure.images.favicon;
      this.baner1360Array = this.editedMarket.structure.images.baner1360;
      this.baner984Array = this.editedMarket.structure.images.baner984;
      this.baner728Array = this.editedMarket.structure.images.baner728;
      this.baner280Array = this.editedMarket.structure.images.baner280;
      this.uploadedlogoImage = {
        link: this.editedMarket.structure.images.logo,
        name: 'logo',
        type: ''
      };
      this.uploadedfaviconImage = {
        link: this.editedMarket.structure.images.favicon,
        name: 'favicon',
        type: ''
      };
      this.banerUploader1360Image = {
        link: this.editedMarket.structure.images.baner1360,
        name: 'baner1360',
        type: ''
      };
      this.banerUploader984Image = {
        link: this.editedMarket.structure.images.baner984,
        name: 'baner984',
        type: ''
      };
      this.banerUploader728Image = {
        link: this.editedMarket.structure.images.baner728,
        name: 'baner728',
        type: ''
      };
      this.banerUploader280Image = {
        link: this.editedMarket.structure.images.baner280,
        name: 'baner280',
        type: ''
      };
      this.formVisual.patchValue(this.showMarketVisualProps);
      this.formTech.patchValue(this.showMarketTechProps);
      this.textColor = this.editedMarket.structure && this.editedMarket.structure.colors ? 
      this.editedMarket.structure.colors.textColor : '#ff0000';
      this.linkColor = this.editedMarket.structure && this.editedMarket.structure.colors ?
      this.editedMarket.structure.colors.linkColor : '#ffffff';
      this.buttonColor = this.editedMarket.structure && this.editedMarket.structure.colors ?
      this.editedMarket.structure.colors.buttonColor : '#000';
      this.buttonTextColor = this.editedMarket.structure && this.editedMarket.structure.colors ?
      this.editedMarket.structure.colors.buttonTextColor : '#2d60ff';
      this.buttonHoverColor = this.editedMarket.structure && this.editedMarket.structure.colors ?
      this.editedMarket.structure.colors.buttonHoverColor : '#2d60ff';
    });
    this._logoUploadListener();
    this._faviconUploadListener();
    this._baner1360UploadListener();
    this._baner984UploadListener();
    this._baner728UploadListener();
    this._baner280UploadListener();
  }

  private shortMail (mail) {
    if (mail) {
     const ready = mail.split('@');
     return ready[0];
    } else {
      return;
    }
  }

  private _logoUploadListener(): void {
    this.logoUploader.onAfterAddingFile = (fileItem: any) => {
      this._onFileEmit(fileItem, 'logo');
    };
  }

  /**
   * Listener for favicon upload
   */
  private _faviconUploadListener(): void {
    this.faviconUploader.onAfterAddingFile = (fileItem: any) => {
      this._onFileEmit(fileItem, 'favicon');
    };
  }
/**
   * 1
   */
  private _baner1360UploadListener(): void {
    this.banerUploader1360.onAfterAddingFile = (fileItem: any) => {
      this._onFileEmit(fileItem, 'baner1360');
    };
  }
/**
   * 2
   */
  private _baner984UploadListener(): void {
    this.banerUploader984.onAfterAddingFile = (fileItem: any) => {
      this._onFileEmit(fileItem, 'baner984');
    };
  }
/**
   * 3
   */
  private _baner728UploadListener(): void {
    this.banerUploader728.onAfterAddingFile = (fileItem: any) => {
      this._onFileEmit(fileItem, 'baner728');
    };
  }
/**
   * 4
   */
  private _baner280UploadListener(): void {
    this.banerUploader280.onAfterAddingFile = (fileItem: any) => {
      this._onFileEmit(fileItem, 'baner280');
    };
  }

  private _onFileEmit(fileItem, imageType: string): void {
    const formData = new FormData();
    formData.append('file', fileItem._file);
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
  }

  deleteBaner1360 (link) {
    this.baner1360Array = this.baner1360Array.filter(item => {
      return item !== link;
    });
  }

  deleteBaner984 (link) {
    this.baner984Array = this.baner984Array.filter(item => {
      return item !== link;
    });
  }

  deleteBaner728 (link) {
    this.baner728Array = this.baner728Array.filter(item => {
      return item !== link;
    });
  }

  deleteBaner280 (link) {
    this.baner280Array = this.baner280Array.filter(item => {
      return item !== link;
    });
  }

  private _uploadImage(formData: FormData, imageType: string): void {
    this._uploadService.uploadImage(formData)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res: {links: UploadedImage[], message: string}) => {
        if (imageType === 'logo') {
          this.logoImg = res.links[0].link;
          this.uploadedlogoImage = res.links[0];
          this.formVisual.get('imglogo').reset();
          this.formVisual.get('imglogo').setValue(this.uploadedlogoImage.link);
        } else if (imageType === 'favicon') {
          this.faviconImg = res.links[0].link;
          this.uploadedfaviconImage = res.links[0];
          this.formVisual.get('imgfavicon').reset();
          this.formVisual.get('imgfavicon').setValue(this.uploadedfaviconImage.link);
        } else if (imageType === 'baner1360') {
          res.links.forEach((a) => {
            this.baner1360Array.push(a.link);
          });
          this.banerUploader1360Image = res.links[0];
          this.formVisual.get('imgBaner1360').reset();
          this.formVisual.get('imgBaner1360').setValue(this.baner1360Array);
        } else if (imageType === 'baner984') {
          res.links.forEach((a) => {
            this.baner984Array.push(a.link);
          });
          this.banerUploader984Image = res.links[0];
          this.formVisual.get('imgBaner984').reset();
          this.formVisual.get('imgBaner984').setValue(this.banerUploader984Image.link);
        } else if (imageType === 'baner728') {
          res.links.forEach((a) => {
            this.baner728Array.push(a.link);
          });
          this.banerUploader728Image = res.links[0];
          this.formVisual.get('imgBaner728').reset();
          this.formVisual.get('imgBaner728').setValue(this.banerUploader728Image.link);
        } else if (imageType === 'baner280') {
          res.links.forEach((a) => {
            this.baner280Array.push(a.link);
          });
          this.banerUploader280Image = res.links[0];
          this.formVisual.get('imgBaner280').reset();
          this.formVisual.get('imgBaner280').setValue(this.banerUploader280Image.link);
        }

        this._config.showSnackBar$.next({message: 'Файл добавлен!', action: 'ok', duration: 3000});
      }, err => {
        this._config.showSnackBar$.next({message: err.detail, action: 'ok', duration: 3000});
      });
  }


  onFileSelected() {
    const inputNode: any = document.querySelector('#file');
  
    if (typeof (FileReader) !== 'undefined') {
      const reader = new FileReader();
  
      reader.onload = (e: any) => {
        this.srcResult = e.target.result;
      };
  
      reader.readAsArrayBuffer(inputNode.files[0]);
    }
  }

  public saveMarket () {
    const sendData: SaveMarket = {
      siteUrls: [this.formTech.value.domen],
      siteEmails: `${this.formTech.value.email}@${this.formTech.value.domen}`,
      name:  this.formTech.value.marketName,
      fullName: this.formTech.value.senderName,
      logo: [],
      description: this.formTech.value.domen,
      structure: {
        images: {
          logo: this.logoImg,
          favicon: this.faviconImg,
          baner1360: this.baner1360Array,
          baner984: this.baner984Array,
          baner728: this.baner728Array,
          baner280: this.baner280Array,
        },
        colors: {
          textColor: this.textColor,
          linkColor: this.linkColor,
          buttonColor: this.buttonColor,
          buttonTextColor: this.buttonTextColor,
          buttonHoverColor: this.buttonHoverColor
        }
      },
      contacts: [],
      customCompanies: false,
      users: null,
      _links: null
    };
    this.marketServeice.saveEditMarketplace(sendData, this.editedMarket.id).subscribe(next => {
      this.rout.navigate(['/marketplace', 'list-marketplace']);
    });
  }
}

