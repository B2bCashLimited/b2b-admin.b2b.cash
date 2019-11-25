import { Component, ViewChild, OnInit, Input, Output, EventEmitter, forwardRef, OnDestroy, AfterViewInit } from '@angular/core';
import { FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material';
import { LocationService } from '@b2b/services/location.service';
import { City, Geolocation } from '@b2b/models';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'b2b-select-city',
  templateUrl: './select-city.component.html',
  styleUrls: ['./select-city.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectCityComponent),
      multi: true
    }
  ]
})
export class SelectCityComponent implements OnInit, OnDestroy, OnDestroy, AfterViewInit, ControlValueAccessor {

  locationsCtrl = new FormControl();
  locations: Geolocation[] | any = [];
  errorMessage: string;

  private _disabled = true;
  private _regionId: number;
  private onChange: any;
  private selected: any = null;
  private lastApplied: Geolocation;

  @ViewChild(MatAutocompleteTrigger) trigger;

  @Input() validator = false;
  @Input() placeholder: string;
  @Input() limit: number;
  @Input() isRequired = false;
  @Input() selectedCity: string;

  @Input() set isRussia(bool: boolean) {
    this.errorMessage = bool ? 'Заполните поле' : 'Field is required';
  }

  @Input() set regionId(value: number) {
    if (this._regionId !== value) {
      this._regionId = value;

      if (this.locationsCtrl) {
        this.locationsCtrl.reset('');
      }

      if (this._regionId) {
        this._disabled = false;
        this._searchCity();
      } else {
        this._disabled = true;
      }

      this._updateStatus();
    }
  }

  get regionId(): number {
    return this._regionId;
  }

  @Output() locationSelected = new EventEmitter();

  constructor(private _locationService: LocationService) {
  }

  ngOnInit() {
    this._updateStatus();
  }

  ngOnDestroy() {
  }

  ngAfterViewInit() {
    this.trigger.panelClosingActions.subscribe(() => this.onPanelClose());
  }

  writeValue(val): void {
    this.setValue(val);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(): void {
  }

  setDisabledState(value: boolean): void {
    if (value) {
      this.locationsCtrl.disable();
    } else {
      this.locationsCtrl.enable();
    }
  }

  enable(): void {
    this.locationsCtrl.enable();
  }

  disable(): void {
    this.locationsCtrl.disable();
  }

  onSelectionChanged(evt, location): void {
    if (evt.source.selected) {
      this.selected = location;
      this.setValue(location);
      this._apply(location);
    }
  }

  setValue(value): void {
    if (this.locationsCtrl && value) {
      this.selected = value;
      this._apply(value);
    }
  }

  onPanelClose(): void {
    if (this.locations.length === 0 || this.locationsCtrl.value === '') {
      this._apply({name: null, id: null});
      this.locationsCtrl.setValue('');
    } else {
      this._apply(this.locations[0]);
      this.selected = this.locations[0];
    }
  }

  private _searchCity(): void {
    this.locationsCtrl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(str => this._locationService.getCities(str || '', this.regionId))
      )
      .subscribe((locations: City[]) => {
        const selectedCity = locations.find(location => location.nameRu === this.selectedCity);
        this.locations = locations;

        if (selectedCity && Object.keys(selectedCity).length > 0) {
          const evt: any = {source: {selected: true}};
          this.onSelectionChanged(evt, selectedCity);
        }
      });
  }

  private _updateStatus(): void {
    if (!this.locationsCtrl) {
      return;
    }

    if (this._disabled) {
      this.locationsCtrl.disable();
    } else {
      this.locationsCtrl.enable();
    }
  }

  private _close(): void {
    this.trigger.closePanel();
  }

  private _apply(location: Geolocation): void {
    this.locationsCtrl.setValue(location.nameRu);

    if (!this.lastApplied || this.lastApplied.id !== location.id) {
      this.locationSelected.emit(location);
      this.lastApplied = location;

      if (this.onChange) {
        this.onChange(location);
      }
    }

    this._close();
  }
}
