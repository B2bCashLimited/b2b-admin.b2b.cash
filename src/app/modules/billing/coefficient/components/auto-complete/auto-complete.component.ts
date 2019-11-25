import {ClearSubscriptions} from '@b2b/decorators';
import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable, of} from 'rxjs';
import {TransportsService} from '../../services/transports.service';
import {CustomsService} from '../../services/customs.service';
import {debounceTime, distinctUntilChanged, map, startWith, switchMap, tap} from 'rxjs/operators';
import {LocalityService} from '../../services/locality.service';
import {ConfigService} from '@b2b/services/config.service';

type ITEMS_TYPE = 'country' | 'region' | 'customs' | 'airport' | 'port' | 'station';
type SUB_ITEMS_TYPE = 'region' | 'sea' | 'river' | 'customs' | 'airport' | 'station';

@ClearSubscriptions()
@Component({
  selector: 'b2b-tarif-auto-complete',
  templateUrl: './auto-complete.component.html',
  styleUrls: ['./auto-complete.component.scss']
})
export class AutoTarifCompleteComponent implements OnDestroy, OnInit {
  @Output() itemChange = new EventEmitter<{item: any, subItem?: any }>();
  @Input() placeholder: string;
  @Input() subPlaceholder: string;
  @Input() countryId: number;

  autoCompleteControl = new FormControl();
  subAutoCompleteControl = new FormControl();
  items$: Observable<any[]>;
  subItems$: Observable<any>;
  private _selectedItem: any;
  private _type: ITEMS_TYPE;
  private _subType: SUB_ITEMS_TYPE;

  constructor(
    private _config: ConfigService,
    private _locationService: LocalityService,
    private _transportsService: TransportsService,
    private _customsService: CustomsService) {
  }

  get selectedItem(): any {
    return this._selectedItem;
  }

  @Input() set selectedItem(value: any) {
    this._selectedItem = value;
    this.setValue(value);
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

  @Input() set disabled(value: boolean) {
    if (value) {
      this.autoCompleteControl.disable();
    } else {
      this.autoCompleteControl.enable();
    }
  }

  get subType(): SUB_ITEMS_TYPE {
    return this._subType;
  }

  @Input() set subType(value: SUB_ITEMS_TYPE) {
    if (this._subType !== value) {
      this._subType = value;
    }
  }

  ngOnDestroy(): void {
  }

  ngOnInit(): void {
    this.filterItems();
    this.filterSubItems();
  }

  onOptionSelectedChanged(evt): void {
    this._selectedItem = evt;
    this.itemChange.emit({ item: evt });
  }

  onSubOptionSelectedChanged(evt): void {
    this.itemChange.emit({ item: this._selectedItem, subItem: evt });
  }

  onClearClick(): void {
    this._selectedItem = null;
    this.autoCompleteControl.setValue(null);
    this.subAutoCompleteControl.setValue(null);
    this.itemChange.emit({ item: null, subItem: null });
  }

  private filterItems(): void {
    this.items$ = this.autoCompleteControl.valueChanges
      .pipe(
        startWith(''),
        distinctUntilChanged(),
        debounceTime(300),
        switchMap((str: string) => {
          if (str && str.length >= 1) {
            return this.getItemsObservable(this.type, str)
              .pipe(
                tap(res => normalizeOptionValue(res)),
                map((res: any[]) => filterByTypedString(res, str))
              );
          } else {
            return of([]);
          }
        }),
      );
  }

  setValue(value: any) {
    let result = '';
    if (value) {
      if (value.hasOwnProperty('region')) {
        result = `${value[`name${this._config.locale}`]}`;
        result += `${value.area ? '(' + value.area + ')' : ''}, `;
        result += `${value.region.country[`name${this._config.locale}`]}`;
      } else {
        result = `${value[`name${this._config.locale}`]}, ${value.country[`name${this._config.locale}`]}`;
      }
    }

    this.autoCompleteControl.setValue(result);
  }

  private filterSubItems(): void {
    this.subItems$ = this.subAutoCompleteControl.valueChanges
      .pipe(
        startWith(''),
        distinctUntilChanged(),
        debounceTime(300),
        switchMap((str: string) => {
          if (str && str.length >= 1) {
            return this.getSubItemsObservable(this.subType, str)
              .pipe(
                tap(res => normalizeOptionValue(res)),
                map((res: any[]) => filterByTypedString(res, str))
              );
          } else {
            this.subAutoCompleteControl.setValue(null);
            this.itemChange.emit({ item: this._selectedItem, subItem: null });
            return of([]);
          }
        }),
      );
  }

  private getItemsObservable(type: string, str?: string): Observable<any> {
    switch (type) {
      case 'country':
        return this._locationService.getCountries();
      case 'region':
        if ((/river|airport|station/).test(this.subType) && this.countryId) {
          return this._locationService.getCitiesAndRegions(str, this.countryId);
        } else {
          return this._locationService.getCitiesAndRegions(str);
        }
    }
    return of([]);
  }

  private getSubItemsObservable(type: string, str?: string): Observable<any> {
    const field = this.getField();
    const id = this._selectedItem.id;
    switch (type) {
      case 'region':
        return this._locationService.getCitiesAndRegions(str);
      case 'customs':
        return this._customsService.getCustomsPorts(id, field);
      case 'airport':
        return this._transportsService.getAirports(id, field);
      case 'sea':
        return this._locationService.getSeaPorts(id, field);
      case 'river':
        return this._locationService.getRiverPorts(id, field);
      case 'station':
        return this._transportsService.getRailwayStations(id, field);
    }
    return of([]);
  }

  private getField() {
    let field: any = 'country';
    if (this._selectedItem.hasOwnProperty('country')) {
      field = 'region';
    } else if (this._selectedItem.hasOwnProperty('area')) {
      field = 'city';
    }
    return field;
  }
}

function normalizeOptionValue(items: any[]) {
  return items.forEach(item => {
    item.id = +item.id;
    item.name = item.fullName || item.nameRu;
  });
}

function filterByTypedString(res: any[], str: string): any[] {
  return (res || []).filter((item) => item.name.toLowerCase().includes(str.toLowerCase()));
}
