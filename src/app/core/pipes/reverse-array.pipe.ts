import { Pipe, PipeTransform } from '@angular/core';
import { isArray } from 'util';

@Pipe({
  name: 'reverseArray'
})
export class ReverseArrayPipe implements PipeTransform {

  transform(value: any): any {
    if (isArray(value)) {
      return value.slice().reverse();
    }
    return value;
  }

}
