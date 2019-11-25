import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {ConfigService} from '@b2b/services/config.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TnvedEtsngService {

  constructor(
    private _http: HttpClient,
    private _config: ConfigService) {
  }

  getTnvds(value: string, page = 1, limit = 25): Observable<any> {
    const obj: any = {
      'filter[0][where]': 'or',
      'filter[0][type]': 'lowerlike',
      'filter[0][field]': 'tnvedStr',
      'filter[0][value]': `%${value}%`,
      'filter[1][where]': 'or',
      'filter[1][type]': 'lowerlike',
      'filter[1][field]': 'tnvedStr',
      'filter[1][value]': `${value}%`,
      'order-by[0][type]': 'field',
      'order-by[0][field]': 'tnvedStr',
      'order-by[0][direction]': 'desc',
      limit,
      page
    };

    const params = new HttpParams({fromObject: obj});

    return this._http.get(`${this._config.apiUrl}/tnveds`, {params})
      .pipe(
        map((res: any) => {
          return {
            page: res.page,
            pageCount: res.page_count,
            pageSize: res.page_size,
            totalItems: res.total_items,
            tnvds: res._embedded.tnved,
          };
        })
      );
  }

  getEtsngs(value: string, page = 1, limit = 25): Observable<any> {
    const obj: any = {
      'filter[0][where]': 'or',
      'filter[0][type]': 'lowerlike',
      'filter[0][field]': 'codeStr',
      'filter[0][value]': `%${value}%`,
      'filter[1][where]': 'or',
      'filter[1][type]': 'lowerlike',
      'filter[1][field]': 'codeStr',
      'filter[1][value]': `${value}%`,
      'order-by[0][type]': 'field',
      'order-by[0][field]': 'codeStr',
      'order-by[0][direction]': 'desc',
      limit,
      page
    };

    const params = new HttpParams({fromObject: obj});

    return this._http.get(`${this._config.apiUrl}/etsngs`, {params})
      .pipe(
        map((res: any) => {
          return {
            page: res.page,
            pageCount: res.page_count,
            pageSize: res.page_size,
            totalItems: res.total_items,
            etsngs: res._embedded.etsng,
          };
        })
      );
  }

  /**
   * Retrieves TNVED list filtered by name for selecting parent for autocomplete
   */
  getTnvedsListForSelectingParentByName(value: string, page = 1, limit = 25): Observable<any> {
    const url = `${this._config.apiUrl}/tnveds`;
    const obj: any = {
      'filter[0][where]': 'or',
      'filter[0][type]': 'lowerlike',
      'filter[0][field]': 'descRu',
      'filter[0][value]': `%${value}%`,
      'filter[1][where]': 'or',
      'filter[1][type]': 'lowerlike',
      'filter[1][field]': 'descEn',
      'filter[1][value]': `%${value}%`,
      'filter[2][where]': 'or',
      'filter[2][type]': 'lowerlike',
      'filter[2][field]': 'descCn',
      'filter[2][value]': `%${value}%`,
      'filter[3][where]': 'or',
      'filter[3][type]': 'lowerlike',
      'filter[3][field]': 'descRu',
      'filter[3][value]': `${value}%`,
      'filter[4][where]': 'or',
      'filter[4][type]': 'lowerlike',
      'filter[4][field]': 'descEn',
      'filter[4][value]': `${value}%`,
      'filter[5][where]': 'or',
      'filter[5][type]': 'lowerlike',
      'filter[5][field]': 'descCn',
      'filter[5][value]': `${value}%`,
      'filter[6][where]': 'and',
      'filter[6][type]': 'eq',
      'filter[6][field]': 'tnvedType',
      'filter[6][value]': 3,
      'order-by[0][type]': 'field',
      'order-by[0][field]': 'tnvedStr',
      'order-by[0][direction]': 'desc',
      limit,
      page
    };
    const params = new HttpParams({fromObject: obj});

    return this._http.get(url, {params})
      .pipe(
        map((res: any) => res._embedded.tnved)
      );
  }

  /**
   * Retrieves TNVED list filtered by tnved code for selecting parent for autocomplete
   */
  getTnvedsListForSelectingParentByCode(value: string, page = 1, limit = 25): Observable<any> {
    const url = `${this._config.apiUrl}/tnveds`;
    const obj: any = {
      'filter[0][where]': 'or',
      'filter[0][type]': 'lowerlike',
      'filter[0][field]': 'tnvedStr',
      'filter[0][value]': `%${value}%`,
      'filter[1][where]': 'or',
      'filter[1][type]': 'lowerlike',
      'filter[1][field]': 'tnvedStr',
      'filter[1][value]': `${value}%`,
      'filter[2][where]': 'and',
      'filter[2][type]': 'eq',
      'filter[2][field]': 'tnvedType',
      'filter[2][value]': 3,
      'order-by[0][type]': 'field',
      'order-by[0][field]': 'tnvedStr',
      'order-by[0][direction]': 'desc',
      limit,
      page
    };
    const params = new HttpParams({fromObject: obj});

    return this._http.get(url, {params})
      .pipe(
        map((res: any) => res._embedded.tnved)
      );
  }
}
