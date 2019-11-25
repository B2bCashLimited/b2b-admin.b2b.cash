import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CompanyModerationService } from './company-moderation.service';
import { debounceTime, distinctUntilChanged, filter, map, startWith, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { UserService } from '@b2b/services/user.service';
import { PageEvent } from '@angular/material';
import { clearSubscription } from '@b2b/decorators';
import { Subject, Subscription } from 'rxjs';
import { LocationService } from '@b2b/services/location.service';

@Component({
  selector: 'b2b-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss']
})
export class CompaniesComponent implements OnInit, OnDestroy {

  pageCount = 0;
  pageSize = 0;
  length = 0;
  pageIndex = 0;
  formGroup: FormGroup;
  companyStatuses = [
    {label: 'Все', value: -1},
    {label: 'Ожидание', value: 0},
    {label: 'Одобрен', value: 1},
    {label: 'Отклонен', value: 2},
    {label: 'Уточнение', value: 3},
  ];
  companies: any[] = [];
  countries: any[] = [];
  selectedCountries: any[] = [];
  totalCounter = 0;
  questions = null;
  isLoading = false;

  private _currentPage = 1;
  private _companiesSub: Subscription;
  private currentAnswers = [];
  private ratingTemplateId = null;
  private _unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private _formBuilder: FormBuilder,
    private _userService: UserService,
    public locationService: LocationService,
    private _companyModerationService: CompanyModerationService) {
  }

  ngOnInit(): void {
    this._initFormGroup();
    this._handleFormGroup();
    this._getCountries();
  }

  ngOnDestroy(): void {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }

  getPage(pageEvent: PageEvent): void {
    const pageIndex = pageEvent.pageIndex + 1;
    this._currentPage = pageIndex <= this.pageCount ? Math.min(pageIndex, this.pageCount) : 1;
    clearSubscription(this._companiesSub);
    this._companiesSub = this._getCompanies(this._currentPage)
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe(() => this.isLoading = false, () => this.isLoading = false);
  }

  onSelectCountriesChanged(countries: any[]): void {
    const ids = (countries || [])
      .filter(item => item.id !== 0)
      .map(item => item.id);
    ids.forEach(el => {
      this.selectedCountries.push({id: el, count: 0});
    });
    this.formGroup.get('countriesId').patchValue(ids);
  }

  saveQuiz(company): void {
    const quiz = this.questions.map((question, index) => {
      return {
        questionRu: question.questionRu,
        questionEn: question.questionEn,
        questionCn: question.questionCn,
        ...this.currentAnswers[index]
      };
    });

    const requestBody = {
      ratingTemplateId: this.ratingTemplateId,
      userId: this._userService.currentUser.id,
      companyId: +company.id,
      quiz
    };

    this._companyModerationService.saveCompanyQuiz(requestBody)
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe();
  }

  onSelectChange(value: string, idx: number) {
    const scope = value;
    this.currentAnswers[idx] = this.questions[idx].answers.find(answer => answer.scope === scope);
  }

  getRatingTemplate(company: any): void {
    this.currentAnswers = [];

    if (company.country && company.country.id) {
      this._companyModerationService.getRatingTemplate(company.country.id)
        .pipe(
          filter(res => !!res && !!Object.keys(res).length),
          switchMap((res: any) => {
            this.questions = res.quiz;
            this.ratingTemplateId = res.id;
            return this._companyModerationService.getCompanyRatingQuizHistory({companyId: company.id});
          }),
          takeUntil(this._unsubscribe$)
        )
        .subscribe((res: any[]) => {
          this.questions.forEach((question, index) => {
            res.forEach(quiz => {
              if (quiz.questionRu === question.questionRu && quiz.answerRu) {
                const scope = (quiz.factCost / quiz.maxCost).toString();
                const answer = question.answers.find(currAnswer => currAnswer.scope === scope);
                question.selectedAnswer = answer.scope;
                this.onSelectChange(scope, index);
              }
            });
          });
        });
    }
  }

  private _initFormGroup(): void {
    this.formGroup = this._formBuilder.group({
      status: 0,
      search: null,
      languages: this._formBuilder.group({
        En: true,
        Ru: true,
        Cn: true,
      }),
      countriesId: null,
    });
  }

  private _handleFormGroup(): void {
    this.formGroup.valueChanges
      .pipe(
        startWith(this.formGroup.value),
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => this.companies = []),
        switchMap(() => this._getCompanies()),
        switchMap(() => {
          const {countriesId, status} = this.formGroup.value;
          const query = {
            countries: JSON.stringify(countriesId || [0]),
            status
          };
          this.isLoading = false;

          return this._companyModerationService.getCompaniesCountByCountry(query);
        })
      )
      .subscribe(res => this.selectedCountries = res, () => this.isLoading = false);
  }

  private _getCountries(): void {
    this.locationService.getCountries()
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe(res => res.forEach(c => this.countries[c.id] = c));
  }

  private _getCompanies(page = 1) {
    const {languages} = this.formGroup.value;
    const filters = {
      ...this.formGroup.value,
      languages: Object.keys(languages).filter(key => languages[key] && key),
    };
    this.isLoading = true;

    return this._companyModerationService.getCompanies(filters, page)
      .pipe(
        map((res: any) => {
          this.pageSize = res.pageSize;
          this.pageCount = res.pageCount;
          this.pageIndex = res.page - 1;
          this.length = res.pageCount * res.pageSize;
          this.totalCounter = res.totalItems;
          this.companies = res.companies;

          return this.companies;
        })
      );
  }

  onConfirmCompany(companyId): void {
    this.companies = this.companies.filter(c => c.id !== companyId);
    this.totalCounter = this.companies.length;
  }
}
