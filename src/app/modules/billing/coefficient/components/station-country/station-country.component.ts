import { Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs';
import { ConfigService } from '@b2b/services/config.service';
import { LocalityService } from '../../services/locality.service';
import { skip } from 'rxjs/operators';

@Component({
  selector: 'b2b-station-country',
  templateUrl: './station-country.component.html',
  styleUrls: ['./station-country.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StationCountryComponent),
      multi: true
    }
  ]
})
export class StationCountryComponent implements OnInit, OnDestroy, ControlValueAccessor {
  locationsCtrl = new FormControl();
  filteredLocations: Observable<any[]>;

  _placeholder: string;
  _limit: number;
  _value: string;
  _disabled: boolean;
  _floatPlaceholder = '';

  onChange;
  found: any = [];
  selected: any = null;
  lastApplied: any;

  @Input() stationType = 'rail';

  @Input()
  set placeholder(val: string) {
    this._placeholder = val;
  }

  @Input()
  set limit(val: number) {
    this._limit = val;
  }

  @Input()
  set value(val) {
    if (val) {
      val.country = val.country || val._embedded && val._embedded.country;
      this._value = `${val[`name${this._config.locale}`]}, ${val.country && val.country[`name${this._config.locale}`]}`;
    }
    this.setValue(val);
  }

  @Input()
  set disabled(val: boolean) {
    this._disabled = val;
    this.statusUpdate();
  }

  @Input() countryId;

  @Input()
  set floatPlaceholder(val: string) {
    this._floatPlaceholder = val || '';
  }

  @Input() fullLocationObj = false;
  @Output() selectionChange = new EventEmitter();
  @Output() getFullSelectLocation = new EventEmitter();

  locations: string[] = [];

  constructor(
    private _config: ConfigService,
    private _localityService: LocalityService) {
  }

  ngOnInit() {
    const sliceLimit = this._limit ? this._limit : undefined;

    this._localityService.stationsAndCountriesChanged
      .subscribe((locations) => {
        this.locations = [];
        this.locations = locations.map((location) => {
          if (!this.countryId && location._embedded && location._embedded.country) {
            return (`${location[`name${this._config.locale}`]}, ${location._embedded.country[`name${this._config.locale}`]}`)
              .slice(0, sliceLimit);
          }
          return (location[`name${this._config.locale}`]).slice(0, sliceLimit);
        });
        this.found = locations;
      });

    this.statusUpdate();
    this.setValue(this._value);

    this.locationsCtrl.valueChanges
      .pipe(skip(1))
      .subscribe((val) => {
        if (val) {
          if (typeof val === 'string') {
            this._localityService.getStationsAndCountries(this.stationType, val.split(',')[0], this.countryId);
          } else if (!val.id) {
            this.locationsCtrl.setValue(undefined);
            this.selected = undefined;
          } else {
            val.country = val.country || val._embedded && val._embedded.country;
            if (val.country) {
              if (val.area) {
                this.locationsCtrl.setValue(`${val[`name${this._config.locale}`]}, ${val.area}`);

                if (this.selected) {
                  this.selected = `${val[`name${this._config.locale}`]}, ${val.country[`name${this._config.locale}`]}`;
                }
              } else {
                this.locationsCtrl.setValue(`${val[`name${this._config.locale}`]}, ${val.country[`name${this._config.locale}`]}`);
                this.selected = `${val[`name${this._config.locale}`]}, ${val.country[`name${this._config.locale}`]}`;
              }
            }
          }
        } else {
          this.locations = [];
        }
      });
  }

  ngOnDestroy() {
  }

  writeValue(val) {
    this.setValue(val);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched() {
  }

  setDisabledState(value: boolean) {
    if (value) {
      this.locationsCtrl.disable();
    } else {
      this.locationsCtrl.enable();
    }
  }

  setValue(value) {
    if (!this.locationsCtrl || !value) {
      this.locationsCtrl.setValue('');
    }

    this.locationsCtrl.setValue(value);
    this.selected = value;
  }

  statusUpdate() {
    if (!this.locationsCtrl) {
      return;
    }

    if (this._disabled) {
      this.locationsCtrl.disable();
    } else {
      this.locationsCtrl.enable();
    }
  }

  onFocusout() {
    if (!this.selected) {
      if (this.found.length === 0 || this.locationsCtrl.value === '') {
        this.apply({ name: null, id: null, country: null });
        this.locationsCtrl.setValue('');
      } else {
        this.apply(this.found[0]);
        this.locationsCtrl.setValue((this.found[0].area ? (this.found[0].area + ', ') : '') + this.found[0]['name' + this._config.locale]);
        this.selected = this.found[0];
      }
    } else {
      if (!this.locationsCtrl.value) {
        this.locationsCtrl.setValue(null);
        this.apply(null);
      } else if (this.selected.id) {
        this.selected.country = this.selected.country || this.selected._embedded && this.selected._embedded.country;
        let val = `${this.selected[`name${this._config.locale}`]}, `;
        val += `${this.selected.country ? this.selected.country[`name${this._config.locale}`] : ''}`;
        this.locationsCtrl.setValue(val);
        this.apply(this.selected);
      } else {
        this.locationsCtrl.setValue(this.selected);
      }
    }
  }

  enable() {
    this.locationsCtrl.enable();
  }

  disable() {
    this.locationsCtrl.disable();
  }

  apply(location) {
    if (this.lastApplied !== location) {
      this.selectionChange.emit(location);
      this.lastApplied = location;
    }
  }

  onSelect(evt, location, i) {
    if (evt.source.selected) {
      this.selected = location;
    }
    this.getFullSelectLocation.emit(this.found[i]);
  }
}
