import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from '@angular/material';

@Component({
  // tslint:disable-next-line
  selector: 'app-close-chat-dialog',
  templateUrl: './close-chat-dialog.component.html',
  styleUrls: ['./close-chat-dialog.component.scss']
})
export class CloseChatDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<CloseChatDialogComponent>) { }

  ngOnInit() {
  }

}
