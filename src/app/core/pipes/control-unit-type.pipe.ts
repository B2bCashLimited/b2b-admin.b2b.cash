import {Pipe, PipeTransform} from '@angular/core';


@Pipe({
  name: 'controlUnitTypePipe'
})
export class ControlUnitTypePipe implements PipeTransform {
  transform(value: any[], id: number) {
    return (value || []).filter(item => item.controlUnitType.id === id);
  }
}
