import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'b2b-choice-of-language',
  templateUrl: './choice-of-language.component.html',
  styleUrls: ['./choice-of-language.component.scss']
})
export class ChoiceOfLanguageComponent {
  @Input() lang: string;
  @Output() langChange = new EventEmitter();
  dropdown = false;
  constructor() {}

  changeLanguage(lang) {
    this.langChange.emit(lang);
  }
}
