import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statisticsOrdersOffers'
})
export class StatisticsOrdersOffersPipe implements PipeTransform {

  transform(value: any[], argsArr: string[] | null): any {
    if (argsArr && argsArr.length > 0) {
      const filteredArr = [];
      
      value.forEach(item => {
        if (argsArr.includes(item.value)) {
          filteredArr.push(item);
        }
      });
      
      
      return filteredArr;
    }
  
    return value;
  }

}
