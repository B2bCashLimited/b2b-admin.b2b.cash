import { Component, OnInit, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, skip } from 'rxjs/operators';
import { ConfigService } from '@b2b/services/config.service';

class Geolocation {
  name?: string;
  nameEn?: string;
  nameRu?: string;
  nameCn?: string;
  type?: string;
  id?: string;
  country?: Geolocation;
  active?: boolean;
  locality?: any;
  coords?: { lat: string, lng: string };
  _embedded?: {
    region: {
      _embedded: { country: Geolocation }
    }
  };
  region?: {
    country?: Geolocation
  };
}

@Component({
  selector: 'b2b-city-area',
  templateUrl: './city-area.component.html',
  styleUrls: ['./city-area.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CityAreaComponent),
      multi: true
    }
  ]
})
export class CityAreaComponent implements OnInit {
  locationsCtrl = new FormControl();
  areaCtrl = new FormControl();
  areaChangedFromCity = false;
  @Input() pointTransfer: any = [{ country: '' }];
  @Input() regionId: any;
  @Input()
  _placeholder = 'Введите город';
  _placeholderArea: string;
  _limit: number;
  _value: string;
  _disabled: boolean;
  lastApplied: Geolocation;
  selected: any = null;
  justSelected = false;
  onChange;
  found: any = [];
  delay: any;
  clickedInside = false;
  showDropdown = false;
  loading = false;
  loadingTriggered: 0;
  loadingEnded: 0;

  countryId: number;

  @Input()
  set setCountryId(val: number) {
    this.countryId = val;
  }

  @Input()
  set value(val: Geolocation) {
    if (val) {
      this._value = `${val.name || val.locality && val.locality.nameRu}, ${val.country.name || val.country.nameRu}`;
    }
    this.setValue(this._value);
  }

  @Input()
  set disabled(val: boolean) {
    this._disabled = val;
    this.statusUpdate();
  }

  @Input()
  set placeholder(val: string) {
    this._placeholder = val;
  }

  @Input()
  set placeholderArea(val: string) {
    this._placeholderArea = val;
  }

  @Input() fullLocationObj = false;
  @Output() selectLocation = new EventEmitter();
  @Output() getFullSelectLocation = new EventEmitter();

  locations: string[] = [];

  constructor(
    private _config: ConfigService,
    private _http: HttpClient) { }

  ngOnInit() {
    this.locationsCtrl = new FormControl();
    this.areaCtrl = new FormControl();
    this.statusUpdate();
    this.setValue(this._value);
    this.locationsCtrl.valueChanges.pipe(
      skip(1),
      distinctUntilChanged(),
      debounceTime(500)
    ).subscribe((val) => {
      if (val && !this.justSelected && val !== this.pointTransfer.country && !this._disabled) {
        this.loadingTriggered++;
        this.loading = true;
        this.showDropdown = true;
        if (this.areaCtrl.value) {
          this.areaCtrl.setValue('');
          this.areaChangedFromCity = true;
        }
        this.getCityAreaRegion(val, this.countryId, this.regionId)
          .subscribe((res: any) => {
            this.onResultRecieved(res._embedded.locality);
            this.loadingEnded++;
            this.loading = (this.loadingTriggered === this.loadingEnded);
          });
      } else {
        this.areaCtrl.setValue('');
        this.locations = [];
        this.justSelected = false;
        this.showDropdown = false;
      }
    });

    this.areaCtrl.valueChanges.subscribe((area) => {
      if (this.locationsCtrl.value && !this.areaChangedFromCity) {
        this.loadingTriggered++;
        this.loading = true;
        this.getCityAreaRegion(this.locationsCtrl.value, this.countryId, this.regionId, area)
          .subscribe((res: any) => {
            this.onResultRecieved(res._embedded.locality);
            this.loadingEnded++;
            this.loading = (this.loadingTriggered === this.loadingEnded);
          });
      }
      this.areaChangedFromCity = false;
    });
  }

  getCityAreaRegion(searchName: string, country?: number, region?: number, areaName = '', limit = 10) {
    const params: any = {
      searchName,
      limit
    };

    if (areaName) {
      params['areaName'] = areaName;
    }

    if (country) {
      params['country'] = country;
    }
    if (region) {
      params['region'] = region;
    }

    return this._http.get(`${this._config.apiUrl}/get-dictionary-cache?url=/api/v1/search-locality?`, { params: params });
  }

  clickInside(evt) {
  }

  writeValue(val) {
    this.setValue(val);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched() {
  }

  markTouched() {
    this.locationsCtrl.markAsTouched();
  }

  onResultRecieved(locations: Geolocation[]) {
    this.found = [];
    this.locations = [];
    locations.map((location: Geolocation) => {
      const _name = location['name' + this._config.locale];
      const _area = location['area'] ? ` (${location['area']})` : '';
      const _country = this.countryId ? '' : (', ' + location['region'].country[`name${this._config.locale}`]);
      this.locations.push(_name + _area + _country);
      this.found.push(location);
    });
    // this.found = this.locations;
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

  setLocation() {
    setTimeout(() => {
      if (!this.selected) {
        if (this.found.length === 0 || this.locationsCtrl.value === '') {
          this.apply({ name: null, id: null, country: null });
          this.locationsCtrl.setValue('');
        } else {
          this.apply(this.found[0]);
          this.locationsCtrl.setValue(this.found[0].area + ', ' + this.found[0]['name' + this._config.locale]);
          this.selected = this.found[0];
        }
      } else {
        if (!this.locationsCtrl.value) {
          this.locationsCtrl.setValue(null);
          this.apply(null);
        } else if (this.selected.id) {
          this.locationsCtrl.setValue(this.selected.area + ', ' + this.selected['name' + this._config.locale]);
          this.apply(this.selected);
        } else {
          this.locationsCtrl.setValue(this.selected);
          this.apply(this.selected);
        }
      }
    }, 100);
  }

  apply(location: Geolocation) {
    if (this.lastApplied !== location) {
      this.selectLocation.emit(location);
      if (this.onChange && typeof this.onChange === 'function') {
        this.onChange(location);
      }
      this.lastApplied = location;
    }
  }

  onSelect(evt, location, i) {
    this.selected = location;
    this.getFullSelectLocation.emit(this.found[i]);
    this.setLocation();
    this.justSelected = true;   // ??
    this.showDropdown = false;
  }
}
