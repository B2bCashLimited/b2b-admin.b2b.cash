import {Component, ElementRef, Input} from '@angular/core';

@Component({
  selector: 'b2b-mailer-text-area',
  templateUrl: './mailer-text-area.component.html',
  styleUrls: ['./mailer-text-area.component.scss']
})
export class MailerTextAreaComponent {

  element: any;

  private _mailText: string;

  constructor(
    private _elementRef: ElementRef) {
    this.element = this._elementRef.nativeElement;
  }

  get mailText() {
    return this._mailText;
  }

  @Input() set mailText(value: string) {
    if (this._mailText !== value) {
      this._mailText = value;
    }
  }
}
