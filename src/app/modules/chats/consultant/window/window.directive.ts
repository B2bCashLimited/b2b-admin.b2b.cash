import {
  Directive,
  Inject,
  ElementRef,
  OnInit,
  Input,
  Renderer2
} from '@angular/core';

@Directive({
  selector: '[appAutofocus]'
})
export class ChatFocusDirective implements OnInit {
  private focus = true;
  @Input() set appAutofocus(condition: boolean) {
    this.focus = condition !== false;
  }
  constructor(@Inject(ElementRef) private element: ElementRef, private render: Renderer2) {
  }
  ngOnInit() {
    if (this.focus) {
      this.element.nativeElement.focus();
      // window.setTimeout(() => this.render.invokeElementMethod(this.element.nativeElement, 'focus', []));
    }
  }
}
