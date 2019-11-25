import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {ConfigService} from '@b2b/services/config.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ControlUnitType, Unit} from '@b2b/models';
import {UnitType} from '@b2b/enums';

@Injectable({
  providedIn: 'root'
})
export class UnitsService {

  constructor(
    private _config: ConfigService,
    private _http: HttpClient) {
  }

  getUnits(page = 1, limit = -1): Observable<any> {
    const obj: any = {page, limit};
    const params = new HttpParams({fromObject: obj});
    // TODO will use later
    // filter[0][type]=eq&filter[0][field]=controlUnitType&filter[0][value]=2
    return this._http.get(`${this._config.apiUrl}/unit`, {params})
      .pipe(
        map((res: any) => {
          const units = getUnits(res._embedded.unit);
          return {
            page: res.page,
            pageCount: res.page_count,
            pageSize: res.page_size,
            totalItems: res.total_items,
            units
          };
        })
      );
  }

  createUnit(body: Unit): Observable<Unit> {
    return this._http.post(`${this._config.apiUrl}/unit`, body)
      .pipe(
        map((res: any) => {
          const {controlUnitType} = res._embedded;
          return {
            id: +res.id,
            nameRu: res.nameRu,
            nameEn: res.nameEn,
            nameCn: res.nameCn,
            controlUnitType: {
              id: +controlUnitType.id,
              nameRu: controlUnitType.nameRu,
              nameEn: controlUnitType.nameEn,
              nameCn: controlUnitType.nameCn,
            }
          } as Unit;
        })
      );
  }

  updateUnit(id: number, body: Unit): Observable<any> {
    return this._http.put(`${this._config.apiUrl}/unit/${id}`, body)
      .pipe(
        map((res: any) => {
          const {controlUnitType} = res._embedded;
          return {
            id: +res.id,
            nameRu: res.nameRu,
            nameEn: res.nameEn,
            nameCn: res.nameCn,
            controlUnitType: {
              id: +controlUnitType.id,
              nameRu: controlUnitType.nameRu,
              nameEn: controlUnitType.nameEn,
              nameCn: controlUnitType.nameCn,
            }
          } as Unit;
        })
      );
  }

  deleteUnit(id: number): Observable<any> {
    return this._http.delete(`${this._config.apiUrl}/unit/${id}`);
  }

  getUnitsByControlUnitType(): Observable<{ [key: string]: Unit[] }> {
    return this.getUnits()
      .pipe(
        map((res: any) => res.units),
        map((units: Unit[]) => {
          return units.reduce((prev, item: Unit) => {
            switch (+item.controlUnitType.id) {
              case UnitType.Calculated:
                prev.calculated.push(item);
                break;
              case UnitType.Monetary:
                prev.monetary.push(item);
                break;
              case UnitType.Volumetric:
                prev.volumetric.push(item);
                break;
              case UnitType.Weight:
                prev.weight.push(item);
                break;
            }
            return prev;
          }, {calculated: [], monetary: [], volumetric: [], weight: []});
        })
      );
  }

  getControlUnitTypes(): Observable<ControlUnitType[]> {
    return this._http.get(`${this._config.apiUrl}/control-unit-types`)
      .pipe(
        map((res: any) => {
          const controlUnitTypes: ControlUnitType[] = [];
          res._embedded.control_unit_type
            .forEach((item: ControlUnitType) => {
              const obj: ControlUnitType = {
                id: +item.id,
                nameRu: item.nameRu,
                nameEn: item.nameEn,
                nameCn: item.nameCn,
              };
              controlUnitTypes.push(obj);
            });
          return controlUnitTypes.sort((a, b) => a.id - b.id);
        })
      );
  }
}


function getUnits(items: any) {
  const units: any[] = [];
  items.forEach((item: any) => {
    const {controlUnitType} = item._embedded;
    const unit: Unit = {
      id: +item.id,
      nameRu: item.nameRu,
      nameEn: item.nameEn,
      nameCn: item.nameCn,
      controlUnitType: {
        id: +controlUnitType.id,
        nameRu: controlUnitType.nameRu,
        nameEn: controlUnitType.nameEn,
        nameCn: controlUnitType.nameCn,
      }
    };
    units.push(unit);
  });
  return units;
}
