import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({ name: 'highlight' })
export class HighlightPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }

  transform(value: any, args: any): any {
    if (!args) {
      return value;
    }
    let re;
    try {
      re = new RegExp(args, 'i');
    } catch (error) {
      return value;
    }
    const match = value.match(re);

    if (!match) {
      return value;
    }

    const replacedValue = value.replace(re, '<span class="highlight">' + match[0] + '</span>');
    return this.sanitizer.bypassSecurityTrustHtml(replacedValue);
  }
}
