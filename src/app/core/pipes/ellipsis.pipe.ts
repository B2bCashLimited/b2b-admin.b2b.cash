import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'ellipsis'
})
export class EllipsisPipe implements PipeTransform {

  transform(value: any, limit: number = 50): any {
    return (value && value.length > limit) ? value.substring(0, limit) + '...' : value;
  }
}
