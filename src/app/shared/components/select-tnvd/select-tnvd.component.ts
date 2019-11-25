import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {TnvedEtsngService} from '@b2b/services/tnved-etsng.service';
import {debounceTime, distinctUntilChanged, map, switchMap, tap} from 'rxjs/operators';
import {Subject, Subscription} from 'rxjs';
import {clearSubscription} from '@b2b/decorators';

@Component({
  selector: 'b2b-select-tnvd',
  templateUrl: './select-tnvd.component.html',
  styleUrls: ['./select-tnvd.component.scss']
})
export class SelectTnvdComponent implements OnInit {
  @Output() tnvdChange = new EventEmitter();
  
  tnvds: any[] = [];
  pageSize = 0;
  pageCount = 0;
  length = 0;
  loading = false;
  tnvdsInput = new Subject<string>();
  
  private _currentPage = 1;
  private _tnvdsSub: Subscription;
  
  constructor(
    private _tnvedEtsngService: TnvedEtsngService) {
  }
  
  ngOnInit() {
    this.tnvdsInput
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => this.tnvds = []),
        switchMap((name: string) => this._getTnvds(name))
      ).subscribe(() => {}, () => this.loading = false);
  }
  
  onSelectedTnvdChanged(evt: any): void {
    if (evt) {
      if (typeof evt === 'string') {
        this.tnvdChange.emit({
          tnved: +evt,
          tnvedStr: evt.toString()
        });
      } else {
        evt.tnved = +evt.tnved;
        evt.tnvedStr = evt.tnvedStr || evt.tnved.toString();
        this.tnvdChange.emit(evt);
      }
    } else {
      this.tnvdChange.emit(evt);
    }
  }
  
  onTnvdsScrollToEnd(): void {
    this._currentPage++;
    this._currentPage = this._currentPage <= this.pageCount ? Math.min(this._currentPage, this.pageCount) : 1;
    clearSubscription(this._tnvdsSub);
    this._tnvdsSub = this._getTnvds(null, this._currentPage).subscribe();
  }
  
  onDescriptionClick(evt: any) {
    evt.stopPropagation();
  }
  
  private _getTnvds(name = '', page = 1) {
    this.loading = true;
    return this._tnvedEtsngService.getTnvds(name, page)
      .pipe(
        map((res: any) => {
          this.loading = false;
          this.pageSize = res.pageSize;
          this.pageCount = res.pageCount;
          this.length = res.totalItems;
          return this.tnvds = [...this.tnvds, ...res.tnvds];
        })
      );
  }
  
}
