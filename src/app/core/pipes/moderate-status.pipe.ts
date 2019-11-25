import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'moderateStatus'
})
export class ModerateStatusPipe implements PipeTransform {
  
  transform(value: any, formGroupValue: any): any {
    
    if (formGroupValue.searchBySeen && !formGroupValue.searchByNotSeen) {
      return (value || []).filter(item => item.viewedByModerator);
    } else if (!formGroupValue.searchBySeen && formGroupValue.searchByNotSeen) {
      return (value || []).filter(item => !item.viewedByModerator);
    }
    
    return value;
  }
  
}
