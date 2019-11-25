import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { UserService } from '@b2b/services/user.service';
import { CompanyModerationService } from '../company-moderation.service';
import { SocketService } from '@b2b/services/socket.service';

const ACTIONS_LIST = {
  approve: 1,
  reject: 2,
  correct: 3,
};

@Component({
  selector: 'b2b-company-details',
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.scss']
})
export class CompanyDetailsComponent implements OnInit {
  @Input()
  company: any;

  formGroup: FormGroup;
  @Output() confirmCompany = new EventEmitter<number>();

  constructor(
    private _formBuilder: FormBuilder,
    private _userService: UserService,
    private _socketService: SocketService,
    private _companyModerationService: CompanyModerationService) {
  }

  ngOnInit() {
    this.formGroup = this._formBuilder.group({
      correctBtn: null,
      rejectBtn: null,
      approveBtn: null,
      question: null,
      correct: null,
      reject: null,
    });
  }

  onSaveCompanyQuizClick(idx = 0): void {
    const quiz = this.company.quiz
      .map((question: any, i: number) => {
        const questionToSave = {
          questionRu: question.questionRu,
          questionEn: question.questionEn,
          questionCn: question.questionEn,
        };
        const companiesForm = this.formGroup.get('companies') as FormArray;
        const ratingForm = companiesForm.controls[idx].get('ratingsForm') as FormArray;
        const scope = ratingForm.at(i).get('scope').value;
        const answerToSave = question.answers.find(el => scope === el.scope);

        return { ...questionToSave, ...answerToSave };
      });

    const body = {
      ratingTemplateId: this.company.ratingTemplate.id,
      userId: this._userService.currentUser.id,
      companyId: this.company.id,
      quiz,
    };

    this._companyModerationService.saveCompanyQuiz(body)
      .subscribe();
  }

  onModerateCompanyClick(action: string): void {
    const status = ACTIONS_LIST[action];
    const message = this.formGroup.value[action] || '';
    this._companyModerationService.moderateCompany(this.company.id, action, message)
      .subscribe(() => {
        this.company.status = status;
        const data = { company_id: this.company.id, status };
        this._socketService.emit('company_status_update', data);
        if (status === ACTIONS_LIST.approve) {
          this._socketService.emit('tariff_client_update', { companyId: this.company.id });
        }
        this.confirmCompany.emit(this.company.id);
      });
  }

}
