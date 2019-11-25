import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, startWith, takeUntil, tap } from 'rxjs/operators';
import { Observable, of, Subject } from 'rxjs';
import { LocationService } from '@b2b/services/location.service';
import { ConfigService } from '@b2b/services/config.service';
import { TransportsService } from '@b2b/services/transports.service';

type ITEMS_TYPE = 'country' | 'region' | 'customs' | 'airport' | 'station' | 'sea' | 'river';

@Component({
  selector: 'b2b-auto-complete',
  templateUrl: './auto-complete.component.html',
  styleUrls: ['./auto-complete.component.scss']
})
export class AutoCompleteComponent implements OnDestroy {
  @Input() placeholder: string;
  @Input() subPlaceholder: string;
  @Input() countryId: number;

  @Input() set disabled(value) {
    this._disabled = value;

    if (this._disabled) {
      this.autoCompleteControl.disable();
    } else {
      this.autoCompleteControl.enable();
    }
  }

  @Input() set reset(value: boolean) {
    if (value) {
      this.onClearClick();
    }
  }

  get type(): ITEMS_TYPE {
    return this._type;
  }

  @Input() set type(value: ITEMS_TYPE) {
    if (this._type !== value) {
      this._type = value;
    }
  }

  @Input() set selectedItemName(value: any) {
    if (value && this._selectedItem !== value) {
      this._selectedItem = value;
      this.autoCompleteControl.setValue(value.name);
    }
  }

  @Output() localityChanged = new EventEmitter<any>();

  autoCompleteControl = new FormControl(null);
  items$: Observable<any[]>;
  isLoading = false;

  private _selectedItem: any;
  private _disabled = false;
  private _type: ITEMS_TYPE;
  private _unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private _config: ConfigService,
              private _locationService: LocationService,
              private _transportsService: TransportsService) {
    this.filterItems();
  }

  ngOnDestroy(): void {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }

  onOptionSelectedChanged(evt): void {
    this._selectedItem = evt;
    this.localityChanged.emit(evt);
  }

  onClearClick(): void {
    this._selectedItem = null;
    this.autoCompleteControl.setValue(null);
    this.localityChanged.emit(null);
  }

  private normalizeOptionValue(items: any[]): void {
    return items.forEach(item => {
      item.id = +item.id;
      item.name = item.fullName || item[this._config.name];
    });
  }

  private filterItems(): void {
    this.autoCompleteControl.valueChanges
      .pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this._unsubscribe$)
      )
      .subscribe((str: string) => {
        this.isLoading = true;

        if (str && str.length >= 1) {
          this.isLoading = false;
          this.items$ = this.getItemsObservable(this.type, str)
            .pipe(
              tap(res => this.normalizeOptionValue(res)),
              map((res: any[]) => filterByTypedString(res, str))
            );
        } else {
          this.isLoading = false;
          this.onClearClick();
          this.items$ = of([]);
        }
      });
  }

  private getItemsObservable(type: string, query?: string): Observable<any> {
    switch (type) {
      case 'country':
        return this._locationService.getCountries();
      case 'region':
        return this._transportsService.getCitiesAndRegions(query);
      case 'customs':
        return this._transportsService.getCustomsPorts(query);
      case 'airport':
        return this._transportsService.getAirports(query);
      case 'sea':
        return this._transportsService.getSeaPorts(query);
      case 'river':
        return this._transportsService.getRiverPorts(query);
      case 'station':
        return this._transportsService.getRailwayStations(query);
    }
    return of([]);
  }
}

function filterByTypedString(res: any[], str: string): any[] {
  return (res || []).filter((item) => item.name.toLowerCase().includes(str.toLowerCase()));
}
