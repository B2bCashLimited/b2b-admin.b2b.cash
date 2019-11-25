import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {TnvedEtsngService} from '@b2b/services/tnved-etsng.service';
import {debounceTime, distinctUntilChanged, map, switchMap, tap} from 'rxjs/operators';
import {Subject, Subscription} from 'rxjs';
import {clearSubscription} from '@b2b/decorators';

@Component({
  selector: 'b2b-select-etsng',
  templateUrl: './select-etsng.component.html',
  styleUrls: ['./select-etsng.component.scss']
})
export class SelectEtsngComponent implements OnInit {
  @Output() etsngChange = new EventEmitter();
  
  etsngs: any[] = [];
  pageSize = 0;
  pageCount = 0;
  length = 0;
  loading = false;
  etsngsInput = new Subject<string>();
  
  private _currentPage = 1;
  private _etsngsSub: Subscription;
  
  constructor(
    private _tnvedEtsngService: TnvedEtsngService) {
  }
  
  ngOnInit() {
    this.etsngsInput
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => this.etsngs = []),
        switchMap((name: string) => this._getEtsngs(name))
      ).subscribe(() => {}, () => this.loading = false);
  }
  
  onSelectedEtsngChanged(evt: any): void {
    if (evt) {
      if (typeof evt === 'string') {
        this.etsngChange.emit({
          code: +evt,
          codeStr: evt.toString()
        });
      } else {
        evt.code = +evt.code;
        evt.codeStr = evt.codeStr || evt.code.toString();
        this.etsngChange.emit(evt);
      }
    } else {
      this.etsngChange.emit(evt);
    }
  }
  
  onEtsngsScrollToEnd(): void {
    this._currentPage++;
    this._currentPage = this._currentPage <= this.pageCount ? Math.min(this._currentPage, this.pageCount) : 1;
    clearSubscription(this._etsngsSub);
    this._etsngsSub = this._getEtsngs(null, this._currentPage).subscribe();
  }
  
  onDescriptionClick(evt: any) {
    evt.stopPropagation();
  }
  
  private _getEtsngs(name = '', page = 1) {
    this.loading = true;
    return this._tnvedEtsngService.getEtsngs(name, page)
      .pipe(
        map((res: any) => {
          this.loading = false;
          this.pageSize = res.pageSize;
          this.pageCount = res.pageCount;
          this.length = res.totalItems;
          return this.etsngs = [...this.etsngs, ...res.etsngs];
        })
      );
  }
  
}
