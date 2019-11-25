import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, mergeMap } from 'rxjs/operators';
import { Observable, timer } from 'rxjs';
import { ClearSubscriptions } from '@b2b/decorators';
import { RatingService } from '@b2b/services/rating.service';

@ClearSubscriptions()
@Component({
  selector: 'b2b-configure-rating-dialog',
  templateUrl: './configure-rating-dialog.component.html',
  styleUrls: ['./configure-rating-dialog.component.scss']
})
export class ConfigureRatingDialogComponent implements OnInit, OnDestroy {
  formGroup: FormGroup;
  isLoading = false;

  private _vector = ['0.25', '0.5', '0.75', '1', '1.25', '1.5', '1.75', '2', '2.25', '2.5'];
  private _quiz: any;
  private _ratingTemplateId: any;

  constructor(private _matDialogRef: MatDialogRef<ConfigureRatingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private _dialogData: any,
    private _formBuilder: FormBuilder,
    private _ratingService: RatingService,
    private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    const ranges = this._dialogData.template.ranges;
    this._quiz = this._dialogData.template.quiz;
    this._ratingTemplateId = this._dialogData.template.id;
    this.formGroup = this.buildForm(ranges);
    this.calculateFroms();
    this.trackTicksChanges().subscribe(() => this.validateToes());
  }

  ngOnDestroy() {
  }

  private buildForm(ranges: number[]) {
    const validatorRequired = [Validators.required, Validators.min(1)];
    const form = this._formBuilder.group({
      '0.25': this._formBuilder.group({ from: 0, to: [ranges[0] || '', validatorRequired] }),
      '0.5': this._formBuilder.group({ from: 0, to: [ranges[1] || '', validatorRequired] }),
      '0.75': this._formBuilder.group({ from: 0, to: [ranges[2] || '', validatorRequired] }),
      '1': this._formBuilder.group({ from: 0, to: [ranges[3] || '', validatorRequired] }),
      '1.25': this._formBuilder.group({ from: 0, to: [ranges[4] || '', validatorRequired] }),
      '1.5': this._formBuilder.group({ from: 0, to: [ranges[5] || '', validatorRequired] }),
      '1.75': this._formBuilder.group({ from: 0, to: [ranges[6] || '', validatorRequired] }),
      '2': this._formBuilder.group({ from: 0, to: [ranges[7] || '', validatorRequired] }),
      '2.25': this._formBuilder.group({ from: 0, to: [ranges[8] || '', validatorRequired] }),
      '2.5': this._formBuilder.group({ from: 0, to: '' }),
    });

    this._vector.forEach(tick => form.controls[tick].get('from').disable());
    return form;
  }

  private calculateFroms() {
    // по всем, кроме первого
    for (let index = 1; index < this._vector.length; index += 1) {
      const line: FormGroup = this.formGroup.controls[this._vector[index]] as FormGroup;
      const previousLine: FormGroup = this.formGroup.controls[this._vector[index - 1]] as FormGroup;

      const fromF = line.controls.from as FormControl;
      const previousToF = previousLine.controls.to as FormControl;

      if (previousToF.value) {
        fromF.setValue((+previousToF.value + 1) || '', { emitEvent: false });
      }
    }
  }

  onCloseClick(save = false) {
    if (save) {
      this.isLoading = true;

      const ranges = [];
      this._vector.forEach(tick => {
        if (!!this.formGroup.controls[tick].get('to').value) {
          ranges.push(+this.formGroup.controls[tick].get('to').value);
        }
      });
      const data: any = {
        id: this._ratingTemplateId,
        quiz: this._quiz,
        ranges
      };

      this._ratingService.putRatingTemplate(data)
        .subscribe(() => {
          this._matDialogRef.close(save);
          this.snackBar.open('Шаблон рейтинга обновлен', 'Ok', { duration: 3000 });
          this.isLoading = false;
        }, () => this.isLoading = false);
    } else {
      this._matDialogRef.close();
    }
  }

  private validateToes() {
    // по всем, кроме первого и последнего
    for (let index = 1; index < this._vector.length - 1; index += 1) {
      const line: FormGroup = this.formGroup.controls[this._vector[index]] as FormGroup;
      const previousLine: FormGroup = this.formGroup.controls[this._vector[index - 1]] as FormGroup;
      const toF = line.controls.to as FormControl;
      const previousToF = previousLine.controls.to as FormControl;

      if (+previousToF.value >= +toF.value) {
        toF.setErrors({ less: true }, { emitEvent: false });
      } else {
        toF.setErrors(null, { emitEvent: false });
      }
    }
  }

  private trackTicksChanges(): Observable<any> {
    return this.formGroup.valueChanges.pipe(
      debounceTime(200),
      mergeMap(() => {
        this.calculateFroms();
        return timer(200);
      })
    );
  }
}
