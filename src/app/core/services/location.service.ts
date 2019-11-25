import { Injectable } from '@angular/core';
import { ConfigService } from '@b2b/services/config.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Cities, City, Countries, Country, Region, Regions } from '@b2b/models';
import { isNumeric } from '@b2b/utils';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor(
    private _config: ConfigService,
    private _http: HttpClient) {
  }

  getCountries(): Observable<Country[]> {
    const obj = {
      'order-by[0][type]': 'field',
      'order-by[0][field]': `name${this._config.locale}`,
      'order-by[0][direction]': 'asc'
    };
    const params = new HttpParams({ fromObject: obj });

    return this._http.get(`${this._config.apiUrl}/country`, { params })
      .pipe(
        map((res: Countries) => {
          const countries = res._embedded.country;
          countries.forEach(country => country.id = +country.id);
          return countries;
        })
      );
  }

  /**
   * Retrieves available regions
   */
  getRegions(countryId: number, limit = -1): Observable<Region[]> {
    const obj = {
      'filter[0][type]': 'eq',
      'filter[0][field]': 'country',
      'filter[0][value]': `${countryId}`,
      'order-by[0][type]': 'field',
      'order-by[0][field]': `name${this._config.locale}`,
      'order-by[0][direction]': 'asc',
      'limit': `${limit}`
    };
    const params = new HttpParams({ fromObject: obj });

    return this._http.get(`${this._config.apiUrl}/region`, { params })
      .pipe(
        map((res: Regions) => res._embedded.region)
      );
  }

  /**
   * Retrieves available cities
   */
  getCities(query: string, regionId: number, limit = -1): Observable<City[]> {
    if (!isNumeric(regionId)) {
      return of([]);
    }

    const obj = {
      'filter[0][type]': 'lowerlike',
      'filter[0][where]': 'or',
      'filter[0][field]': 'nameEn',
      'filter[0][value]': `${query}%`,
      'filter[1][type]': 'lowerlike',
      'filter[1][where]': 'or',
      'filter[1][field]': 'nameCn',
      'filter[1][value]': `${query}%`,
      'filter[2][type]': 'lowerlike',
      'filter[2][where]': 'or',
      'filter[2][field]': 'nameRu',
      'filter[2][value]': `${query}%`,
      'filter[3][type]': 'lowerlike',
      'filter[3][where]': 'or',
      'filter[3][field]': 'nameEn',
      'filter[3][value]': `%${query}%`,
      'filter[4][type]': 'lowerlike',
      'filter[4][where]': 'or',
      'filter[4][field]': 'nameCn',
      'filter[4][value]': `%${query}%`,
      'filter[5][type]': 'lowerlike',
      'filter[5][where]': 'or',
      'filter[5][field]': 'nameRu',
      'filter[5][value]': `%${query}%`,
      'filter[6][type]': 'innerjoin',
      'filter[6][field]': 'region',
      'filter[6][alias]': 'r',
      'order-by[0][type]': 'field',
      'order-by[0][field]': 'area',
      'order-by[0][direction]': 'desc',
      'limit': `${limit}`
    };
    if (regionId) {
      obj['filter[7][type]'] = 'eq';
      obj['filter[7][field]'] = 'id';
      obj['filter[7][where]'] = 'and';
      obj['filter[7][alias]'] = 'r';
      obj['filter[7][value]'] = `${regionId}`;
    }
    const params = new HttpParams({ fromObject: obj });

    return this._http.get(`${this._config.apiUrl}/locality`, { params })
      .pipe(
        map((res: Cities) => {
          const localities: City[] = res._embedded.locality;
          localities.forEach((item: any) => {
            item.fullName = `${item.nameRu}${item.area ? ' (' + item.area + ')' : ''}`;
          });

          return localities.sort((a: any, b: any) => a.fullName - b.fullName);
        })
      );
  }

  setCordinat(data) {
    return this._http.post(`${this._config.apiUrl}/location`, data).pipe(
      map((res: any) => {
        if (res) {
          res.locality = res.locality || res._embedded.locality;
          res.region = res.region || res.locality &&
            (res.locality.region || res.locality._embedded.region);
          res.country = res.country || res.region &&
            (res.region.country || res.region._embedded.country);
        }
        return res;
      })
    );
  }

  updateCordinat(id: number, data) {
    return this._http.put(`${this._config.apiUrl}/location/${id}`, data).pipe(
      map((res: any) => {
        if (res) {
          res.locality = res.locality || res._embedded.locality;
          res.region = res.region || res.locality &&
            (res.locality.region || res.locality._embedded.region);
          res.country = res.country || res.region &&
            (res.region.country || res.region._embedded.country);
        }
        return res;
      })
    );
  }
}
