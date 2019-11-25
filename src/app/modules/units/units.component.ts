import {Component, OnDestroy, OnInit} from '@angular/core';
import {UnitsService} from '@b2b/services/units.service';
import {Observable, Subscription} from 'rxjs';
import {ControlUnitType, Unit} from '@b2b/models';
import {MatDialog, PageEvent} from '@angular/material';
import {UnitDialogComponent} from './dialogs/unit-dialog/unit-dialog.component';
import {filter, map, switchMap} from 'rxjs/operators';
import {clearSubscription, ClearSubscriptions} from '@b2b/decorators';
import {ConfirmDeleteComponent} from './dialogs/confirm-delete/confirm-delete.component';

@ClearSubscriptions()
@Component({
  selector: 'b2b-units',
  templateUrl: './units.component.html',
  styleUrls: ['./units.component.scss']
})
export class UnitsComponent implements OnDestroy, OnInit {
  controlUnitTypes$: Observable<ControlUnitType[]>;
  units: Unit[];
  pageCount = 0;
  pageSize = 0;
  length = 0;

  private _selectedIndex = 1;
  private _tmpUnits: any[];
  private _sub: Subscription;
  private _currentPage = 1;

  constructor(
    private _unitsService: UnitsService,
    private _matDialog: MatDialog) {
  }

  ngOnDestroy(): void {
    // @ClearSubscriptions()
  }

  ngOnInit() {
    this.controlUnitTypes$ = this._unitsService.getControlUnitTypes();
    this._sub = this._getAllUnits().subscribe();
  }

  onAddUnitDialogClick(): void {
    this._matDialog.open(UnitDialogComponent, {
      width: '500px',
      data: {
        controlUnitType: this._selectedIndex
      },
      disableClose: true,
    }).afterClosed()
      .pipe(
        filter((res) => res && !!res),
        switchMap((res) => this._unitsService.createUnit(res)),
      )
      .subscribe((unit: Unit) => {
        this.units = [...this.units, unit];
        this._tmpUnits = [...this._tmpUnits, unit];
      });
  }

  onDestroyUnitClick(unitId: number): void {
    this._matDialog.open(ConfirmDeleteComponent, {
      width: '500px',
      data: {},
      disableClose: true,
    }).afterClosed()
      .pipe(
        filter((res) => res && !!res),
        switchMap(() => this._unitsService.deleteUnit(unitId)),
      )
      .subscribe(() => {
        this.units = this.units.filter(unit => unit.id !== unitId);
        this._tmpUnits = this._tmpUnits.filter(unit => unit.id !== unitId);
      });
  }

  onEditUnitClick(unit: Unit): void {
    this._matDialog.open(UnitDialogComponent, {
      width: '500px',
      data: {
        unit: {
          nameEn: unit.nameEn,
          nameRu: unit.nameRu,
          nameCn: unit.nameCn,
          controlUnitType: unit.controlUnitType.id,
        }
      },
      disableClose: true,
    }).afterClosed()
      .pipe(
        filter((res) => res && !!res),
        switchMap((res) => this._unitsService.updateUnit(unit.id, res)),
      )
      .subscribe((data: Unit) => {
        unit.nameRu = data.nameRu;
        unit.nameEn = data.nameEn;
        unit.nameCn = data.nameCn;
        unit.controlUnitType = data.controlUnitType;
        this.units = [...this.units];
      });
  }

  onSelectedIndexChanged(tabIndex: number) {
    this.units = this._tmpUnits;
    this._selectedIndex = tabIndex + 1;
  }

  getPage(pageEvent: PageEvent): void {
    const pageIndex = pageEvent.pageIndex + 1;
    this._currentPage = pageIndex <= this.pageCount ? Math.min(pageIndex, this.pageCount) : 1;
    clearSubscription(this._sub);
    this._sub = this._getAllUnits(this._currentPage, this.pageSize).subscribe();
  }

  private _getAllUnits(page = 1, limit = 25): Observable<any> {
    return this._unitsService.getUnits(page, limit)
      .pipe(
        map((res: any) => {
          this.pageSize = res.pageSize;
          this.pageCount = res.pageCount;
          this.length = res.totalItems;
          this._tmpUnits = this.units = res.units;
        })
      );
  }
}
