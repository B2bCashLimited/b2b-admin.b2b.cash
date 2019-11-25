import {Component, Inject, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {ActivityNameService} from '@b2b/services/activity-name.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {keys} from 'lodash';

interface LanguagesModalData {
  language: string[];
  activity: number[];
  isBuyer: boolean;
  workingSchedule: any;
  adminPositionId: number;
}

@Component({
  selector: 'b2b-languages-dialog',
  templateUrl: './languages-dialog.component.html',
  styleUrls: ['./languages-dialog.component.scss']
})
export class LanguagesDialogComponent implements OnInit {
  formGroup: FormGroup;
  workingSchedule: any;
  adminPositionId: number;

  constructor(
    private _formBuilder: FormBuilder,
    private _activityNameService: ActivityNameService,
    private _matDialogRef: MatDialogRef<LanguagesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private _dialogData: LanguagesModalData) {
  }

  ngOnInit() {
    this.formGroup = this._formBuilder.group({
      country: null,
      languages: this._formBuilder.group({
        En: false,
        Ru: false,
        Cn: false,
      }),
      activityNames: this._formBuilder.array([])
    });
    const {languages} = this.formGroup.value;
    const {language, activity, isBuyer} = this._dialogData;
    this.workingSchedule = this._dialogData.workingSchedule;
    this.adminPositionId = this._dialogData.adminPositionId;
    keys(languages).forEach(key => {
      this.formGroup.get(`languages.${key}`)
        .patchValue((language || []).includes(key));
    });
    if (!isBuyer) {
      this._activityNameService.getActivityNames()
        .subscribe((activityNames: any) => {
          const items = this.formGroup.get('activityNames') as FormArray;
          activityNames.filter(item => item.keyName !== 'buyer')
            .forEach(item => {
              items.push(this._formBuilder.group({
                selected: (activity || []).includes(item.id),
                id: item.id,
                name: item.nameRu,
              }));
            });
        });
    }
  }

  onCreatedWorkingScheduleChanged(workingSchedule: any): void {
    this.workingSchedule = workingSchedule;
  }

  onCloseClick(save: boolean) {
    const {languages, activityNames} = this.formGroup.value;
    if (save) {
      const data = {
        country: [],
        language: keys(languages).filter(key => languages[key] && key),
        activity: activityNames.filter(item => item.selected).map(item => item.id),
        workingSchedule: this.workingSchedule
      };
      this._matDialogRef.close(data);
    } else {
      this._matDialogRef.close();
    }
  }

}
