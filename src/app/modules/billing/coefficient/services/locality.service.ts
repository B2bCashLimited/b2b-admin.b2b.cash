import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {ConfigService} from '@b2b/services/config.service';
import {Observable, of, Subject} from 'rxjs';
import {map} from 'rxjs/operators';
import {isNumeric} from '@b2b/utils';

@Injectable()
export class LocalityService {
  stationsAndCountriesChanged = new Subject<any[]>();

  private stationsAndCountries: any;

  constructor(
    private _http: HttpClient,
    private _config: ConfigService) {
  }

  /**
   * Retrieve available countries
   */
  getCountries(): Observable<any[]> {
    const url = `${this._config.apiUrl}/country`;
    const obj = {
      'order-by[0][type]': 'field',
      'order-by[0][field]': `name${this._config.locale}`,
      'order-by[0][direction]': 'asc'
    };
    const params = new HttpParams({fromObject: obj});

    return this._http.get(url, {params})
      .pipe(
        map((res: any) => res._embedded.country)
      );
  }

  /**
   * Retrieve available regions
   */
  getRegions(countryId: number, limit = -1): Observable<any[]> {
    const url = `${this._config.apiUrl}/region`;
    const obj = {
      'filter[0][type]': 'eq',
      'filter[0][field]': 'country',
      'filter[0][value]': `${countryId}`,
      'order-by[0][type]': 'field',
      'order-by[0][field]': `name${this._config.locale}`,
      'order-by[0][direction]': 'asc',
      'limit': `${limit}`
    };
    const params = new HttpParams({fromObject: obj});

    return this._http.get(url, {params})
      .pipe(
        map((res: any) => res._embedded.region)
      );
  }

  /**
   * Retrieve available countries
   */
  getCities(query: string, regionId: number, limit = -1): Observable<any[]> {
    if (!isNumeric(regionId)) {
      return of([]);
    }
    const url = `${this._config.apiUrl}/locality`;
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
      'filter[7][type]': 'eq',
      'filter[7][field]': 'id',
      'filter[7][where]': 'and',
      'filter[7][alias]': 'r',
      'filter[7][value]': `${regionId}`,
      'order-by[0][type]': 'field',
      'order-by[0][field]': 'area',
      'order-by[0][direction]': 'desc',
      'limit': `${limit}`
    };
    const params = new HttpParams({fromObject: obj});

    return this._http.get(url, {params})
      .pipe(
        map((res: any) => {
          const localities = res._embedded.locality;
          localities.forEach((item: any) => {
            item.fullName = `${item['name' + this._config.locale]}`;
            item.fullName += `${item.area ? ' (' + item.area + ')' : ''}`;
          });

          return localities
            .sort((a: any, b: any) => a.fullName - b.fullName);
        })
      );
  }

  /**
   * Retrieve available countries
   */
  getSeaPorts(id: number, field: 'country' | 'region' | 'city', limit = -1): Observable<any[]> {
    const url = `${this._config.apiUrl}/sea-port`;
    const obj = {
      'filter[0][type]': 'eq',
      'filter[0][field]': `${field}`,
      'filter[0][value]': `${id}`,
      'order-by[0][type]': 'field',
      'order-by[0][field]': `name${this._config.locale}`,
      'order-by[0][direction]': 'asc',
      'limit': `${limit}`
    };
    const params = new HttpParams({fromObject: obj});

    return this._http.get(url, {params})
      .pipe(
        map((res: any) => res._embedded.sea_port)
      );
  }

  /**
   * Retrieve available countries
   */
  getRiverPorts(id: number, field: 'country' | 'region' | 'city', limit = -1): Observable<any[]> {
    const url = `${this._config.apiUrl}/river-port`;
    const obj = {
      'filter[0][type]': 'eq',
      'filter[0][field]': `${field}`,
      'filter[0][value]': `${id}`,
      'order-by[0][type]': 'field',
      'order-by[0][field]': `name${this._config.locale}`,
      'order-by[0][direction]': 'asc',
      'limit': `${limit}`
    };
    const params = new HttpParams({fromObject: obj});

    return this._http.get(url, {params})
      .pipe(
        map((res: any) => res._embedded.river_port)
      );
  }

  /**
   * Gets cities and regions by given query string
   */
  getCitiesAndRegions(query: string, countryId?: number): Observable<any> {
    const url = `${this._config.apiUrl}/search-city-and-region`;
    const obj = {
      'q': `${query}`
    };
    if (isNumeric(countryId)) {
      obj['countryId'] = `${countryId}`;
    }
    const params = new HttpParams({fromObject: obj});

    return this._http.get(url, {params})
      .pipe(
        map((res: any) => {
          const localities = res.localities.data;
          const regions = res.regions.data;
          localities.forEach((item) => {
            item.fullName = `${item['name' + this._config.locale]}`;
            item.fullName += `${item.area ? '(' + item.area + ')' : ''}, `;
            item.fullName += `${item.region.country['name' + this._config.locale]}`;
          });
          regions.forEach((item) => {
            item.fullName = `${item['name' + this._config.locale]}, `;
            item.fullName += `${item.country['name' + this._config.locale]}`;
          });
          return [...regions, ...localities]
            .sort((a: any, b: any) => a.fullName - b.fullName);
        })
      );
  }

  getCountriesPhoneCodes(limit = -1): Observable<any[]> {
    const obj: any = {
      'order-by[0][type]': 'field',
      'order-by[0][field]': `name${this._config.locale}`,
      'order-by[0][direction]': 'asc',
      limit
    };
    const params = new HttpParams({fromObject: obj});
    return this._http.get(`${this._config.apiUrl}/phone-codes`, {params})
      .pipe(
        map((res: any) => res._embedded.phone_codes)
      );
  }

  getStationsAndCountries(type: string, key: string, countryId?: number) {
    let obs: Observable<any>;
    switch (type) {
      case 'rail':
        obs = this.getPorts('railway-station', key, 'railway_station', countryId);
        break;
      case 'sea':
        obs = this.getPorts('sea-port', key, 'sea_port', countryId);
        break;
      case 'river':
        obs = this.getPorts('river-port', key, 'river_port', countryId);
        break;
      case 'air':
        obs = this.getPorts('air-port', key, 'air_port', countryId);
        break;
    }
    obs.subscribe((res: any) => {
      this.stationsAndCountries = res;
      this.stationsAndCountriesChanged.next(this.stationsAndCountries.slice());
    });
  }

  private getPorts(api: string, key: string, prop: string, countryId?: number) {
    const obj = {
      'filter[0][type]': 'lowerlike',
      'filter[0][where]': 'or',
      'filter[0][field]': `nameRu`,
      'filter[0][value]': `%${key}%`,
      'filter[1][type]': 'lowerlike',
      'filter[1][where]': 'or',
      'filter[1][field]': `nameEn`,
      'filter[1][value]': `%${key}%`,
      'filter[2][type]': 'lowerlike',
      'filter[2][where]': 'or',
      'filter[2][field]': `nameCn`,
      'filter[2][value]': `%${key}%`,
      'filter[3][type]': 'lowerlike',
      'filter[3][where]': 'or',
      'filter[3][field]': `nameRu`,
      'filter[3][value]': `${key}%`,
      'filter[4][type]': 'lowerlike',
      'filter[4][where]': 'or',
      'filter[4][field]': `nameEn`,
      'filter[4][value]': `${key}%`,
      'filter[5][type]': 'lowerlike',
      'filter[5][where]': 'or',
      'filter[5][field]': `nameCn`,
      'filter[5][value]': `${key}%`,
    };
    if (isNumeric(countryId)) {
      obj['filter[6][type]'] = 'innerjoin';
      obj['filter[6][field]'] = 'country';
      obj['filter[6][alias]'] = 'c';
      obj['filter[7][type]'] = 'eq';
      obj['filter[7][field]'] = 'id';
      obj['filter[7][where]'] = 'and';
      obj['filter[7][alias]'] = 'c';
      obj['filter[7][value]'] = `${countryId}`;
    }
    if (api === 'air-port') { // поиск по кодам аэропортов
      obj['filter[8][type]'] = 'lowerlike';
      obj['filter[8][where]'] = 'or';
      obj['filter[8][field]'] = 'iataCode';
      obj['filter[8][value]'] = key;
    }
    const params = new HttpParams({fromObject: obj});

    return this._http.get(`${this._config.apiUrl}/${api}`, {params})
      .pipe(
        map((res: any) => res._embedded && res._embedded[prop])
      );
  }

}
