import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'b2b-confirm-popup',
  templateUrl: './confirm-popup.component.html',
  styleUrls: ['./confirm-popup.component.scss']
})
export class ConfirmPopupComponent implements OnInit {

  title: string;
  constructor(
    @Inject(MAT_DIALOG_DATA) private _dialogData: any) {
    this.title = this._dialogData.title;
  }

  ngOnInit() { }
}
