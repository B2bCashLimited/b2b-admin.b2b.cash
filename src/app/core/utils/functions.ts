import {CategoryPropertySpecial} from '@b2b/enums';
import {WorkingDay} from '@b2b/components/working-schedule/working-schedule-summary';
import {FormGroup} from '@angular/forms';

export function removeEmptyProperties(props: any): any {
  return Object.keys(props || {})
    .filter((key) => props[key] !== undefined && props[key] !== null)
    .filter((key) => props[key] !== 'undefined' && props[key] !== 'null')
    .filter((key) => (Array.isArray(props[key]) && props[key].length) || !Array.isArray(props[key]))
    .reduce((obj, key) => {
      obj[key] = props[key];
      return obj;
    }, {});
}

export function isSpecialCategory(special: number): boolean {
  return [
    CategoryPropertySpecial.Named,
    CategoryPropertySpecial.Compared,
    CategoryPropertySpecial.WithFormula
  ].includes(special);
}

/**
 * Converts time zero to double zero for showing working schedule times in view
 */
export function convertTimeZeroToDoubleZero(timeObj: any): string {
  const startHour = timeObj.startHour === 0 || timeObj.startHour === '0' || timeObj.startHour === '' ? '00' : timeObj.startHour,
    startMinute = timeObj.startMinute === 0 || timeObj.startMinute === '0' || timeObj.startMinute === '' ? '00' : timeObj.startMinute,
    endHour = timeObj.endHour === 0 || timeObj.endHour === '0' || timeObj.endHour === '' ? '00' : timeObj.endHour,
    endMinute = timeObj.endMinute === 0 || timeObj.endMinute === '0' || timeObj.endMinute === '' ? '00' : timeObj.endMinute;

  return `${startHour}:${startMinute} - ${endHour}:${endMinute}`;
}

/**
 * Sorts selected dates by day of week
 */
export function sortSelectedDaysByDayOfWeek(arr: any[]): any[] {
  return arr.sort((date1, date2) => {
    return date1.dayOfWeek - date2.dayOfWeek;
  });
}

/**
 * Sets working times for showing in view if working schedule view is not flexible
 */
export function setWorkingTimesForView(isRegular: boolean, obj: any): string {
  let workingTimes = '';

  if (!isRegular) {
    workingTimes = convertTimeZeroToDoubleZero(obj);
  } else {
    workingTimes = `${convertTimeZeroToDoubleZero(obj)},...`;
  }

  return workingTimes;
}

export function getFieldValue(form: FormGroup, fieldName: string, propertyName?: string): any | null {
  const filed = form.get(fieldName);
  if (filed && filed.hasOwnProperty('value')) {
    let value = filed.value;
    if (value && typeof value === 'object' && value.hasOwnProperty(propertyName)) {
      value = value[propertyName];
    }
    if (!isNaN(parseFloat(value)) && isFinite(value)) {
      return +value;
    }
    return value;
  }
  return null;
}

export function patchFieldValue(form: FormGroup, fieldName: string, value: any): void {
  if (fieldName && form.get(fieldName)) {
    form.get(fieldName).patchValue(value);
  }
}

/**
 * Sets days of week of working schedule for showing in view if working schedule view is not flexible
 */
export function setWorkingDaysForView(isRegular: boolean, workingDaysArray: WorkingDay[], minDayOfWeekIndex: number,
  maxDayOfWeekIndex: number, weekList: string[]): string {
  let datesOfWeek = '';

  if (!isRegular) {
    datesOfWeek = `${weekList[minDayOfWeekIndex]} - ${weekList[maxDayOfWeekIndex]}`;
  } else {
    const maxDaysOfWeekForView = 4;
    let differentTimesWorkingDates = '';

    if (workingDaysArray.length > maxDaysOfWeekForView) {
      for (let i = 0; i < maxDaysOfWeekForView; i++) {
        differentTimesWorkingDates += `${weekList[workingDaysArray[i].dayOfWeek - 1]},`;
      }
      differentTimesWorkingDates += '...';
    } else {
      workingDaysArray.forEach(workingDay => {
        differentTimesWorkingDates += `${weekList[workingDay.dayOfWeek - 1]}, `;
      });
    }

    datesOfWeek = differentTimesWorkingDates;
  }

  return datesOfWeek;
}

export function isNumeric(obj: any): boolean {
  return (typeof obj === 'number' || typeof obj === 'string')
    && !isNaN((obj as any) - parseFloat(obj as any));
}


export function toPercent(number): number {
  if (!isNaN(number)) {
    return +number * 100;
  }
  return 0;
}

export function toCoefficient(number): number {
  if (!isNaN(number)) {
    return +number / 100;
  }
  return 0;
}
