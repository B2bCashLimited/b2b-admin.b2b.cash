import { Component, ElementRef, Inject, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { CategoryService } from '@b2b/services/category.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CategoryCsv } from '@b2b/models';

@Component({
  selector: 'b2b-csv-type-choose',
  templateUrl: './csv-type-choose.component.html',
  styleUrls: ['./csv-type-choose.component.scss']
})
export class CsvTypeChooseComponent implements OnInit, OnDestroy {

  @ViewChild('google') google: ElementRef;
  @ViewChild('googleIdentity') googleIdentity: ElementRef;
  @ViewChild('yandexXML') yandexXML: ElementRef;
  @ViewChild('yandexCSV') yandexCSV: ElementRef;
  @ViewChild('k50') k50: ElementRef;

  isPending = false;
  googleUrl: string;
  googleIdentityUrl: string;
  yandexXMLUrl: string;
  yandexCSVUrl: string;
  k50Url: string;
  noFileText = 'Нет файла';

  private _unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private _matDialogRef: MatDialogRef<CsvTypeChooseComponent>,
              @Inject(MAT_DIALOG_DATA) private data: any,
              private _categoryService: CategoryService,
              private renderer: Renderer2) {
  }

  ngOnDestroy(): void {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }

  ngOnInit(): void {
    this._downloadCsv();
  }

  closeDialog(): void {
    this._matDialogRef.close();
  }

  private _downloadCsv(): void {
    this.isPending = true;
    this._categoryService.downloadCsv(this.data.categoryId)
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe((res: CategoryCsv[]) => {
        this.isPending = false;

        if (res[0].google && Object.keys(res[0].google).length > 0) {
          this.googleUrl = this.data.simple ? res[0].google.simple : res[0].google.all;
          this.renderer.setAttribute(this.google.nativeElement, 'href', this.googleUrl);
          this.renderer.setAttribute(this.google.nativeElement, 'download', this.googleUrl);
          this.renderer.setAttribute(this.google.nativeElement, 'target', '_blank');
        }

        if (res[0]['google-identity'] && Object.keys(res[0]['google-identity']).length > 0) {
          this.googleIdentityUrl = this.data.simple ? res[0]['google-identity'].simple : res[0]['google-identity'].all;
          this.renderer.setAttribute(this.googleIdentity.nativeElement, 'href', this.googleIdentityUrl);
          this.renderer.setAttribute(this.googleIdentity.nativeElement, 'download', this.googleIdentityUrl);
          this.renderer.setAttribute(this.googleIdentity.nativeElement, 'target', '_blank');
        }

        if (res[0]['yandex-xml'] && Object.keys(res[0]['yandex-xml']).length > 0) {
          this.yandexXMLUrl = this.data.simple ? res[0]['yandex-xml'].simple : res[0]['yandex-xml'].all;
          this.renderer.setAttribute(this.yandexXML.nativeElement, 'href', this.yandexXMLUrl);
          this.renderer.setAttribute(this.yandexXML.nativeElement, 'download', this.yandexXMLUrl);
          this.renderer.setAttribute(this.yandexXML.nativeElement, 'target', '_blank');
        }

        if (res[0]['yandex-csv'] && Object.keys(res[0]['yandex-csv']).length > 0) {
          this.yandexCSVUrl = this.data.simple ? res[0]['yandex-csv'].simple : res[0]['yandex-csv'].all;
          this.renderer.setAttribute(this.yandexCSV.nativeElement, 'href', this.yandexCSVUrl);
          this.renderer.setAttribute(this.yandexCSV.nativeElement, 'download', this.yandexCSVUrl);
          this.renderer.setAttribute(this.yandexCSV.nativeElement, 'target', '_blank');
        }

        if (res[0].k50 && Object.keys(res[0].k50).length > 0) {
          this.k50Url = this.data.simple ? res[0].k50.simple : res[0].k50.all;
          this.renderer.setAttribute(this.k50.nativeElement, 'href', this.k50Url);
          this.renderer.setAttribute(this.k50.nativeElement, 'download', this.k50Url);
          this.renderer.setAttribute(this.k50.nativeElement, 'target', '_blank');
        }
      }, () => this.isPending = false);
  }

}
