import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {LocationService} from '@b2b/services/location.service';
import {Country} from '../utils/countries';

@Component({
  selector: 'b2b-choose-country-dialog',
  templateUrl: './choose-country.component.html',
  styleUrls: ['./choose-country.component.scss']
})
export class ChooseCountryComponent implements OnInit {

  countries: Country[];
  selectedCountryID: number;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ChooseCountryComponent>,
    private locationService: LocationService
  ) {}

  ngOnInit() {
    this.locationService.getCountries().subscribe( (countries: Country[]) => this.countries = countries);
  }

  save() {
    const country = this.countries.find( (_country: Country) => _country.id === +this.selectedCountryID );
    this.dialogRef.close(country);
  }

  cancel() {
    this.dialogRef.close();
  }
}
