import {Directive, ElementRef, HostListener, Input} from '@angular/core';

@Directive({
  selector: '[b2bOnlyDigitsInput]'
})
export class OnlyDigitsInputDirective {
  @Input() appOnlyDigitsInput: number;

  private _el: HTMLInputElement;

  constructor(private _element: ElementRef) {
    this._el = this._element.nativeElement;
  }

  @HostListener('keydown', ['$event'])
  preventLetters(evt) {
    const keyCode = evt.keyCode;
    const allowedCodes = [8, 46, 9, 110, 190];
    return keyCode >= 48 && keyCode <= 57 || keyCode >= 96 && keyCode <= 105 || allowedCodes.includes(keyCode);
  }

  /*@HostListener('keyup', ['$event'])
  @HostListener('paste', ['$event'])
  preventPasteLetters(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    const text = evt.clipboardData && evt.clipboardData.getData('text') || this._el.value;
    let value = text.replace(/[^[0-9]*\.?[0-9]+$]/g, '');
    if (this.appOnlyDigitsInput && this.appOnlyDigitsInput > 0) {
      value = value.slice(0, this.appOnlyDigitsInput);
    }
    this._el.value = value;
  }*/

}
