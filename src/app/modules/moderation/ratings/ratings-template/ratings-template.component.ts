import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Country } from '../dialogs/utils/countries';
import { LocationService } from '@b2b/services/location.service';
import { RatingService } from '@b2b/services/rating.service';

@Component({
  selector: 'b2b-ratings-template-component',
  templateUrl: './ratings-template.component.html',
  styleUrls: ['./ratings-template.component.scss']
})
export class RatingsTemplateComponent implements OnInit {
  create: boolean; // type of component action
  edit: boolean;
  // public questions: RatingTemplateQuestion[];
  template: any;
  questions: any[]; // or quiz
  ranges;
  loading = true;
  countries: any[];
  country: any;
  form: FormGroup;
  activeLanguage = 'Ru';
  ratingTemplateId: number;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private _matDialogRef: MatDialogRef<RatingsTemplateComponent>,
    private _fb: FormBuilder,
    private _ratingService: RatingService,
    private locationService: LocationService
  ) {
  }

  get questionsForm() {
    return this.form.get('questions') as FormArray;
  }

  ngOnInit() {
    this.edit = true;
    this.form = this.buildEmptyForm();
    this.questions = (this.form.controls.questions as FormArray).controls;
    this.ratingTemplateId = this.data.ratingTemplateId;
    this.questions = (this.form.controls.questions as FormArray).controls;
    this.loading = true;
    this.getTemplate(this.ratingTemplateId);

    this.locationService.getCountries()
      .subscribe((countries: Country[]) => {
        this.countries = countries;
        this.country = this.countries.find(_country => _country.id === this.data.id);
      });

  }

  private getTemplate(id: number) {
    this._ratingService.getById(id)
      .subscribe((res: any) => {
        this.loading = false;
        this.questions = res.quiz;
        this.ranges = res.ranges;
        this.questions.forEach(question => {
          const singleQuestionForm = this.buildQuestionForm(question);
          (question.answers as any[]).forEach(answer => {
            const singleAnswerForm = this.buildAnswerForm(answer);
            (singleQuestionForm.controls.answers as FormArray).push(singleAnswerForm);
          });
          this.questionsForm.push(singleQuestionForm);
        });
      });
  }

  private buildEmptyForm() {
    return this._fb.group({
      questions: this._fb.array([]),
    });
  }

  private buildQuestionForm(data = {} as any) {
    return this._fb.group({
      questionRu: [data.questionRu || '', Validators.required],
      questionEn: [data.questionEn || '', Validators.required],
      questionCn: [data.questionCn || '', Validators.required],
      answers: this._fb.array([])
    });
  }

  private buildAnswerForm(data = {} as any) {
    return this._fb.group({
      id: data.id || '',
      answerRu: [data.answerRu || '', Validators.required],
      answerEn: [data.answerEn || '', Validators.required],
      answerCn: [data.answerCn || '', Validators.required],
      scope: [data.scope || '', Validators.required]
    });
  }

  pushQuestion(form: FormGroup) {
    const question = this.buildQuestionForm();
    (form.controls.questions as FormArray).push(question);
    return question;
  }

  addQuestion(form) {
    const question = this.pushQuestion(form);
    this.pushAnswer(question);

    return question;
  }

  pushAnswer(question: FormGroup) {
    const answer = this.buildAnswerForm();
    (question.controls.answers as FormArray).push(answer);
    return answer;
  }

  removeQuestion(form, index) {
    if (index === 0) {
      // this.snackBar.open('Нельзя удалить все вопросы');
      return;
    }
    (form.controls.questions as FormArray).removeAt(index);
  }

  removeAnswer(question, index) {
    if (index === 0) {
      // this.snackBar.open('Нельзя удалить все варианты ответа');
      return;
    }
    (question.controls.answers as FormArray).removeAt(index);
  }

  save(form: FormGroup) {
    this._ratingService.putRatingTemplate({
      id: this.ratingTemplateId,
      quiz: this.questionsForm.value,
      ranges: this.ranges,
    })
      .subscribe(res => {
        // this.snackBar.open('Шаблон сохранен', 'Ок', { duration: 3000 });
      });
  }

  back() {
    this._matDialogRef.close();
  }
}
