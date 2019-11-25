/**
 * Unsubscribes from all available subscriptions within component
 */
import {Subscription} from 'rxjs';

export function ClearSubscriptions(): Function {
  return function (constructor: Function) {
    const original = constructor.prototype.ngOnDestroy;
    if (typeof original !== 'function') {
    }
    constructor.prototype.ngOnDestroy = function () {
      for (const prop in this) {
        const item = this[prop];
        if (item) {
          if (Array.isArray(item) && item.length > 0 && item[0] instanceof Subscription) {
            item.forEach(sub => clearSubscription(sub));
          } else {
            clearSubscription(item);
          }
        }
      }
      original.apply(this, arguments);
    };
  };
}

/**
 * Unsubscribe from observable if not completed
 */
export function clearSubscription(sub: any): void {
  if (sub instanceof Subscription && !sub.closed) {
    sub.unsubscribe();
  }
}
