import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { AllowedImageType } from '@b2b/utils';
import { ConfigService } from '@b2b/services/config.service';
import { UploadService } from '@b2b/services/upload.service';
import { FormBuilder } from '@angular/forms';
import { first, switchMap } from 'rxjs/operators';
import { CategoryService } from '@b2b/services/category.service';

@Component({
  selector: 'b2b-category-icon-edit-dialog',
  templateUrl: './category-icon-edit-dialog.component.html',
  styleUrls: ['./category-icon-edit-dialog.component.scss']
})
export class CategoryIconEditDialogComponent implements OnInit {

  @ViewChild('imgFile') _imgFileInput: ElementRef;

  allowedImageTypes = AllowedImageType.join(',');
  imgFile: File;
  loading: boolean;
  _imgSub: any;
  imgUrl: string;

  constructor(
    private _matDialogRef: MatDialogRef<CategoryIconEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _uploadService: UploadService,
    private _fb: FormBuilder,
    private _config: ConfigService,
    private _categoryService: CategoryService
  ) {
  }

  ngOnInit(): void {
    if (this.data.photos && this.data.photos.length > 0) {
      this.imgUrl = this._config.serverUrl + this.data.photos[0].link;
    }
  }

  onImgFileAdded(): void {
    const files: {[key: string]: File} = this._imgFileInput.nativeElement.files;
    for (const key in files) {
      if (!isNaN(parseInt(key, 3))) {
        this.imgFile = files[key];
      }
    }
    this.uploadImg();
  }

  uploadImg(): void {
    const formData: FormData = new FormData();
    formData.append('file', this.imgFile, this.imgFile.name);
    this._imgSub = this._uploadService.uploadImage(formData)
      .pipe(
        first(),
        switchMap((res: any) => {
          if (res.links.length) {
            const photos = [res.links[0]];
            this.data.photos = photos;
            this.imgUrl = this._config.serverUrl + res.links[0].link;
            return this._categoryService.updateCategory(this.data.categoryId, {photos});
          }
        }),
        switchMap(() => this._categoryService.clearCache())
      )
      .subscribe();
  }

}
