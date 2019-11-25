import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UnitsService } from '@b2b/services/units.service';
import { Unit } from '@b2b/models';
import { Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'b2b-select-currency',
  templateUrl: './select-currency.component.html',
  styleUrls: ['./select-currency.component.scss']
})
export class SelectCurrencyComponent implements OnInit, OnDestroy {

  @Input() set selectedItem(value: number) {
    if (value) {
      this.selectedCurrencyId.setValue(value);
    }
  }

  @Output() selectedCurrency: EventEmitter<number> = new EventEmitter<number>();

  currencies: Unit[];
  selectedCurrencyId = new FormControl(28);

  private _unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private _unitsService: UnitsService) {
  }

  ngOnDestroy(): void {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }

  ngOnInit(): void {
    this._unitsService.getUnitsByControlUnitType()
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe(res => this.currencies = res.monetary);

    this.selectedCurrencyId.valueChanges
      .pipe(
        startWith(this.selectedCurrencyId.value),
        takeUntil(this._unsubscribe$)
      )
      .subscribe(res => this.selectedCurrency.emit(res));
  }

}
