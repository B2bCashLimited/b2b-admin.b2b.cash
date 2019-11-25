import {Injectable} from '@angular/core';
import {ConfigService} from '@b2b/services/config.service';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(
    private _config: ConfigService,
    private _http: HttpClient
  ) {
  }

  /**
   * Retrieves products by given name
   */
  getProductsByName(searchValue: string, page = 1): Observable<any> {
    const obj: any = {
      'filter[1][type]': 'orx',
      'filter[1][where]': 'and',
      'filter[1][conditions][0][field]': 'nameRu',
      'filter[1][conditions][0][type]': 'lowerlike',
      'filter[1][conditions][0][value]': `${searchValue}%`,
      'filter[1][conditions][1][field]': 'nameEn',
      'filter[1][conditions][1][type]': 'lowerlike',
      'filter[1][conditions][1][value]': `${searchValue}%`,
      'filter[1][conditions][2][field]': 'nameCn',
      'filter[1][conditions][2][type]': 'lowerlike',
      'filter[1][conditions][2][value]': `${searchValue}%`,
      'filter[1][conditions][3][field]': 'nameRu',
      'filter[1][conditions][3][type]': 'lowerlike',
      'filter[1][conditions][3][value]': `%${searchValue}%`,
      'filter[1][conditions][4][field]': 'nameEn',
      'filter[1][conditions][4][type]': 'lowerlike',
      'filter[1][conditions][4][value]': `%${searchValue}%`,
      'filter[1][conditions][5][field]': 'nameCn',
      'filter[1][conditions][5][type]': 'lowerlike',
      'filter[1][conditions][5][value]': `%${searchValue}%`,
      'order-by[0][type]': 'field',
      'order-by[0][field]': 'id',
      'order-by[0][direction]': 'desc',
      page
    };

    const params = new HttpParams({fromObject: obj});
    return this._http.get(`${this._config.apiUrl}/products`, {params})
      .pipe(
        map((res: any) => {
          return {
            page: res.page,
            pageCount: res.page_count,
            pageSize: res.page_size,
            totalItems: res.total_items,
            products: res._embedded.product
          };
        })
      );
  }

  /**
   * Retrieves products by given ids
   */
  getProductsByIds(ids: number[]): Observable<any> {
    const obj: any = {};

    if (ids && ids.length > 0) {
      obj['filter[0][type]'] = 'in';
      obj['filter[0][field]'] = 'id';

      for (let i = 0; i < ids.length; i++) {
        obj[`filter[0][values][${i}]`] = ids[i];
      }
    }

    const params = new HttpParams({fromObject: obj});

    return this._http.get(`${this._config.apiUrl}/products`, {params})
      .pipe(map((res: any) => res._embedded.product));
  }

  getManufacturers(categoryId: number): Observable<any> {

    const obj: any = {
      'filter[0][type]': 'eq',
      'filter[0][field]': 'category',
      'filter[0][value]': `${categoryId}`,
      'order-by[3][type]': 'field',
      'order-by[3][field]': `nameRu`,
      'order-by[3][direction]': 'asc',
      'page': 1,
      'perPage': 1000
    };

    const params = new HttpParams({fromObject: obj});
    return this._http.get(`${this._config.apiUrl}/product-manufacturers`, {params})
      .pipe(
        map((res: any) => {
          return res._embedded.product_manufacturer;
        })
      );
  }

  addProductModel(body): Observable<any> {
    return this._http.post(`${this._config.apiUrl}/product-models`, body);
  }

  getProductModels(obj: { field: 'model', manufacturer: number, category: number })
    : Observable<{ id: number, value: string, count: number }[]> {

    const params = new HttpParams({fromObject: obj as any});

    return this._http.get<{ id: number, value: string, count: number }[]>(
      `${this._config.apiUrl}/get-filter-values`, {params}
    );
  }

  getProductModelByName(name: any): Observable<any> {
    const obj: any = {
      'filter[0][type]': 'eq',
      'filter[0][where]': 'or',
      'filter[0][field]': `nameRu`,
      'filter[0][value]': `${name}`,
      'filter[1][type]': 'eq',
      'filter[1][where]': 'or',
      'filter[1][field]': `nameEn`,
      'filter[1][value]': `${name}`,
      'filter[2][type]': 'eq',
      'filter[2][where]': 'or',
      'filter[2][field]': `nameCn`,
      'filter[2][value]': `${name}`
    };

    const params = new HttpParams({fromObject: obj});
    return this._http.get(`${this._config.apiUrl}/product-models`, {params})
      .pipe(map((res: any) => res._embedded.product_model.pop()));
  }

  addProductManufacturer(body): Observable<any> {
    return this._http.post(`${this._config.apiUrl}/product-manufacturers`, body);
  }

  getProductManufacturer(category: number, name: string) {
    const params = new HttpParams({
      fromObject: {
        category: `${category}`,
        nameRu: name,
        nameEn: name,
        nameCn: name
      }
    });
    return this._http.get(`${this._config.apiUrl}/get-product-manufacturer`, {params})
      .pipe(
        map((res: any) => {
          return (res && res['productManufacturer'] && res['productManufacturer'].id) ? res['productManufacturer'] : null;
        })
      );
  }

  getProductManufacturerByName(name: string): Observable<any> {
    const obj: any = {
      'filter[0][type]': 'eq',
      'filter[0][where]': 'or',
      'filter[0][field]': `nameRu`,
      'filter[0][value]': `${name}`,
      'filter[1][type]': 'eq',
      'filter[1][where]': 'or',
      'filter[1][field]': `nameEn`,
      'filter[1][value]': `${name}`,
      'filter[2][type]': 'eq',
      'filter[2][where]': 'or',
      'filter[2][field]': `nameCn`,
      'filter[2][value]': `${name}`
    };

    const params = new HttpParams({fromObject: obj});
    return this._http.get(`${this._config.apiUrl}/product-manufacturers`, {params})
      .pipe(
        map((res: any) => {
          return res._embedded.product_manufacturer.pop();
        })
      );
  }
}
