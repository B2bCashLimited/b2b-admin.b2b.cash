import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { AllowedImageType } from '@b2b/utils';
import { ConfigService } from '@b2b/services/config.service';
import { UploadService } from '@b2b/services/upload.service';
import { FileUploader } from 'ng2-file-upload';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { first, switchMap } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';
import { CategoryService } from '@b2b/services/category.service';


@Component({
  selector: 'b2b-icon-edit-dialog',
  templateUrl: './icon-edit-dialog.component.html',
  styleUrls: ['./icon-edit-dialog.component.scss']
})
export class IconEditDialogComponent implements OnInit {
  allowedImageTypes = AllowedImageType.join(',');
  @ViewChild('imgFile') _imgFileInput: ElementRef;
  public imgFile: File;
  loading: boolean;
  _imgSub: any;
  imgUrl: string;

  constructor(
    private _matDialogRef: MatDialogRef<IconEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _uploadService: UploadService,
    private _fb: FormBuilder,
    private _config: ConfigService,
    private _categoryService: CategoryService
  ) { }

  ngOnInit() {
    if (this.data.iconImage) {
      this.imgUrl = this._config.serverUrl + this.data.iconImage;
    }
  }


  onImgFileAdded() {
    const files: { [key: string]: File } = this._imgFileInput.nativeElement.files;
    for (const key in files) {
      if (!isNaN(parseInt(key, 3))) {
        this.imgFile = files[key];
      }
    }
    this.uploadImg();
  }

  uploadImg() {
    const formData: FormData = new FormData();
    formData.append('file', this.imgFile, this.imgFile.name);
    this._imgSub = this._uploadService.uploadImage(formData)
      .pipe(
        first(),
        switchMap(res => {
          if (res.links.length) {
            this.imgUrl = this._config.serverUrl + res.links[0].link;
            return this._categoryService.updateCategory(this.data.id, {
              iconImage: res.links[0].link
            });
          }
        }),
        switchMap(() => this._categoryService.clearCache())
      )
      .subscribe();
  }

}
