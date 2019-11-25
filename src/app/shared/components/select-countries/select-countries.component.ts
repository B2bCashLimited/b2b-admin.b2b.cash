import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {LocationService} from '@b2b/services/location.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import { Country } from '@b2b/models';

const DEFAULT_COUNTRY_ID = 0;

@Component({
  selector: 'b2b-select-countries',
  templateUrl: './select-countries.component.html',
  styleUrls: ['./select-countries.component.scss']
})
export class SelectCountriesComponent implements OnInit {
  @Input() selectedCountries: number | number[];
  @Input() maxSelectedItems: number;
  @Input() appendTo: 'body' | string | null;
  @Input() multiple = true;
  @Input() defaultValue = true;
  @Input() disabled = false;
  @Output() countriesChange = new EventEmitter<any>();

  countries$: Observable<any>;
  loading = true;

  private _defaultValue = {
    id: DEFAULT_COUNTRY_ID,
    nameRu: 'Все',
    nameEn: 'ALL',
    nameCn: '全部',
  };

  constructor(
    private _locationService: LocationService) {
  }

  ngOnInit() {
    this.countries$ = this._locationService.getCountries()
      .pipe(
        map((countries: Country[]) => {
          this.loading = false;
          if (this.multiple && this.defaultValue) {
            this.selectedCountries = [this._defaultValue.id];
            return [this._defaultValue, ...countries];
          }
          return countries;
        })
      );
  }

  onSelectCountriesChanged(evt) {
    this.countriesChange.emit(evt);
  }

  onRemoveCountriesChanged(evt) {
    if (evt && evt.id === 0 && Array.isArray(this.selectedCountries)) {
      this.selectedCountries = [evt.id, ...this.selectedCountries];
    }
  }

  onClearCountriesChanged(evt) {
    this.selectedCountries = [this._defaultValue.id];
  }

}
