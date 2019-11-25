import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {ChatSettings} from '../../models/chat-settings';

@Component({
  // tslint:disable-next-line
  selector: 'app-consultant-settings-dialog',
  templateUrl: './consultant-settings-dialog.component.html',
  styleUrls: ['./consultant-settings-dialog.component.scss']
})
export class ConsultantSettingsDialogComponent implements OnInit {

  settingsForm: FormGroup;

  constructor(private dialogRef: MatDialogRef<ConsultantSettingsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    const settings = this.data.settings;
    this.settingsForm = new FormGroup({
      clientsNumber: new FormControl(+settings[ChatSettings.NUMBER_OF_CLIENTS] || 0,
        [Validators.required, Validators.min(0)]),
      specialTime: new FormGroup({
        mins: new FormControl(Math.floor(+settings[ChatSettings.AVARIYNOE_TIME] / 60) || 0,
          [Validators.required, Validators.min(0)]),
        secs: new FormControl(+settings[ChatSettings.AVARIYNOE_TIME] % 60 || 0,
          [Validators.required, Validators.min(0), Validators.max(59)])
      }),
      megaSpecialTime: new FormGroup({
        mins: new FormControl(Math.floor(+settings[ChatSettings.FULL_AVARIYNOE_TIME] / 60) || 0,
          [Validators.required, Validators.min(0)]),
        secs: new FormControl(+settings[ChatSettings.FULL_AVARIYNOE_TIME] % 60 || 0,
          [Validators.required, Validators.min(0), Validators.max(59)])
      }),
    });
  }

  submit() {
    this.dialogRef.close(this.settingsForm.value);
  }
}
