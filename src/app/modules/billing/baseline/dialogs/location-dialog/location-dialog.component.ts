import {Component, Inject, Input, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'b2b-location-dialog',
  templateUrl: './location-dialog.component.html',
  styleUrls: ['./location-dialog.component.scss']
})
export class LocationDialogComponent implements OnInit {
  @Input() selectedItemId: number;
  loading = true;
  type: string;

  constructor(
    private _matDialogRef: MatDialogRef<LocationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any) {
  }

  ngOnInit() {
    const types = {
      country: 'страну',
      region: 'регион',
      locality: 'город',
    };
    this.type = types[this.dialogData.type];
  }

  onCloseClick(apply: boolean): void {
    this._matDialogRef.close(apply && this.selectedItemId);
  }

  onLocationSelected(evt: any): void {
    this.selectedItemId = evt && evt.id;
  }
}
