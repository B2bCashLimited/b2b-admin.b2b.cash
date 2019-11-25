import { Component, OnInit, Input, Output, EventEmitter, ViewChild, forwardRef, OnDestroy, AfterViewInit } from '@angular/core';
import { FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material';
import { Observable } from 'rxjs';
import { LocationService } from '@b2b/services/location.service';
import { Region, Geolocation } from '@b2b/models';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'b2b-select-region',
  templateUrl: './select-region.component.html',
  styleUrls: ['./select-region.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectRegionComponent),
      multi: true
    }
  ]
})

export class SelectRegionComponent implements OnInit, OnDestroy, AfterViewInit, ControlValueAccessor {

  locationsCtrl = new FormControl();
  filteredLocations: Observable<any[]>;
  isRussia = false;
  errorMessage: string;

  private _disabled = true;
  private _countryId: number;
  private _onChange: any;
  private _found: any = [];
  private _selected: any = null;
  private _lastApplied: Geolocation;
  private _locations: Geolocation[] | any = [];

  @ViewChild(MatAutocompleteTrigger) trigger;

  @Input() validator = false;
  @Input() placeholder: string;
  @Input() limit: number;
  @Input() isRequired = false;
  @Input() selectedRegion: string;

  @Input() set countryId(val: number) {
    this._countryId = val;

    if (this.locationsCtrl) {
      this.locationsCtrl.reset('');
    }

    if (this._countryId) {
      this._disabled = false;
      this.isRussia = val === 405;
      this.errorMessage = this.isRussia ? 'Заполните поле' : 'Field is required';
      this._getRegions();
    } else {
      this._disabled = true;
    }

    this._updateStatus();
  }

  @Output() locationSelected = new EventEmitter();

  constructor(public _locationService: LocationService) {
  }

  ngOnInit() {
    this._filterInit();
    this._updateStatus();

    this.filteredLocations.subscribe(locations => this._found = locations);
  }

  ngOnDestroy() {
  }

  ngAfterViewInit() {
    this.trigger.panelClosingActions.subscribe(() => this._onPanelClose());
  }

  writeValue(val): void {
    this._setValue(val);
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
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

  onSelectionChanged(evt, location): void {
    if (evt.source.selected) {
      this._selected = location;
      this._setValue(location);
      this._apply(location);
    }
  }

  enable(): void {
    this.locationsCtrl.enable();
  }

  disable(): void {
    this.locationsCtrl.disable();
  }

  private _inputUpdate(): void {
    this.locationsCtrl.setValue(this.locationsCtrl.value);
  }

  private _setValue(value): void {
    if (this.locationsCtrl && value) {
      this._selected = value;
      this._apply(value);
    }
  }

  private _onPanelClose(): void {
    if (this._found.length === 0 || this.locationsCtrl.value === '') {
      this._apply({name: null, id: null});
      this.locationsCtrl.setValue('');
    } else {
      this._apply(this._found[0]);
      this._selected = this._found[0];
    }
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

  private _filterInit(): void {
    const sliceLimit = this.limit ? this.limit : undefined;

    this.filteredLocations = this.locationsCtrl.valueChanges
      .pipe(
        startWith(null),
        map(location => location ? this._filterLocations(location).slice(0, sliceLimit) : this._locations.slice(0, sliceLimit))
      );
  }

  private _filterLocations(name: string): Geolocation[] {
    return this._locations.filter(location => {

      let resolve = false;

      if (location.nameRu && location.nameRu.toLowerCase().includes(name.toLowerCase())) {
        resolve = true;
      }

      if (location.nameEn && location.nameEn.toLowerCase().includes(name.toLowerCase())) {
        resolve = true;
      }

      if (location.nameCn && location.nameCn.toLowerCase().includes(name.toLowerCase())) {
        resolve = true;
      }

      return resolve;
    });
  }

  private _close(): void {
    this.trigger.closePanel();
  }

  private _apply(location: Geolocation) {
    this.locationsCtrl.setValue(location.nameRu);

    if (!this._lastApplied || this._lastApplied.id !== location.id) {
      this.locationSelected.emit(location);
      this._lastApplied = location;

      if (this._onChange) {
        this._onChange(location);
      }
    }

    this._close();
  }

  private _getRegions(): void {
    this._locationService.getRegions(this._countryId)
      .subscribe((locations: Region[]) => {
        const selectedRegion = locations.find(location => location.nameRu === this.selectedRegion);
        this._locations = locations;
        this._inputUpdate();

        if (selectedRegion && Object.keys(selectedRegion).length > 0) {
          const evt: any = {source: {selected: true}};
          this.onSelectionChanged(evt, selectedRegion);
        }
      });
  }
}
