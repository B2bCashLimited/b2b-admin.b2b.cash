import { Injectable } from '@angular/core';
import { ConfigService } from '@b2b/services/config.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { filter, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Cities, City, CustomsPost, CustomsPosts, ReceivedOffersStatistics } from '@b2b/models';

@Injectable({
  providedIn: 'root'
})
export class StatisticsAnalyticsService {

  constructor(
    private _config: ConfigService,
    private _http: HttpClient) {
  }

  /**
   * Retrieves geo statistics
   */
  getGeoStatistics(): Observable<any> {
    return this._http.get(`${this._config.apiUrl}/get-geo-statistics`);
  }

  /**
   * Retrieves statistics
   */
  getStatistics(obj: any): Observable<any> {
    const params = new HttpParams({fromObject: obj});
    return this._http.get(`${this._config.apiUrl}/get-statistics`, {params});
  }

  /**
   * Retrieves companies by given name
   */
  getCompanies(query: any, page = 1, limit = 25): Observable<any> {
    let obj: any = {
      'filter[0][type]': 'eq',
      'filter[0][field]': 'status',
      'filter[0][value]': 1,
      page,
      limit
    };

    if (query.name) {
      obj = {
        ...obj,
        'filter[1][type]': 'lowerlike',
        'filter[1][where]': 'or',
        'filter[1][field]': 'nameRu',
        'filter[1][value]': `%${query.name}%`,
        'filter[2][type]': 'lowerlike',
        'filter[2][where]': 'or',
        'filter[2][field]': 'nameEn',
        'filter[2][value]': `%${query.name}%`,
        'filter[3][type]': 'lowerlike',
        'filter[3][where]': 'or',
        'filter[3][field]': 'nameCn',
        'filter[3][value]': `%${query.name}%`,
      };
    }

    if (query.countryId) {
      if (query.countryId === 405) {
        obj = {
          ...obj,
          'filter[4][type]': 'eq',
          'filter[4][field]': 'country',
          'filter[4][value]': `${query.countryId}`,
        };
      } else {
        obj = {
          ...obj,
          'filter[4][type]': 'neq',
          'filter[4][field]': 'country',
          'filter[4][value]': `${query.countryId}`,
        };
      }
    }

    if (query.selectedCompaniesIds && query.selectedCompaniesIds.length > 0) {
      obj = {
        ...obj,
        'filter[5][type]': 'in',
        'filter[5][field]': 'id',
      };

      for (let i = 0; i < query.selectedCompaniesIds.length; i++) {
        obj[`filter[5][values][${i}]`] = query.selectedCompaniesIds[i];
      }
    }

    const params = new HttpParams({fromObject: obj});

    return this._http.get(`${this._config.apiUrl}/companies`, {params})
      .pipe(
        filter((res: any) => res && res._embedded),
        map((res: any) => {
          const companies = res._embedded.company;
          companies.forEach(item => item.id = +item.id);

          return {
            page: res.page,
            pageCount: res.page_count,
            pageSize: res.page_size,
            totalItems: res.total_items,
            companies
          };
        })
      );
  }

  /**
   * Retrieves available cities by query
   */
  getCities(query: string, page = 1, limit = 25): Observable<City[]> {
    const obj: any = {
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
      'order-by[0][type]': 'field',
      'order-by[0][field]': 'area',
      'order-by[0][direction]': 'desc',
      page,
      limit
    };
    const params = new HttpParams({fromObject: obj});

    return this._http.get(`${this._config.apiUrl}/locality`, {params})
      .pipe(map((res: Cities) => res._embedded.locality));
  }

  /**
   * Retrieve city by given id
   */
  getCityById(id: number): Observable<City> {
    return this._http.get(`${this._config.apiUrl}/locality/${id}`)
      .pipe(map((res: City) => res));
  }

  /**
   * Retrieves customs posts by given city
   */
  getCustomsPosts(cityId: number, limit = -1): Observable<CustomsPost[]> {
    const obj: any = {
      'filter[0][type]': 'eq',
      'filter[0][field]': 'city',
      'filter[0][value]': `${cityId}`,
      limit
    };
    const params = new HttpParams({fromObject: obj});

    return this._http.get(`${this._config.apiUrl}/customs-ports`, {params})
      .pipe(map((res: CustomsPosts) => res._embedded.customs_port));
  }

  /**
   * Retrieves activities by given name and activity names' ID
   */
  getActivitiesByName(name: string, activityName: string, limit = 25): Observable<any> {
    const obj: any = {
      activityName,
      name,
      limit
    };
    const params = new HttpParams({fromObject: obj});
    return this._http.get(`${this._config.apiUrl}/activities`, {params});
  }

  /**
   * Retrieves companies' statistics by given company ids
   */
  getCompaniesStatistics(obj: {companies: string}): Observable<any> {
    const params = new HttpParams({fromObject: obj});
    return this._http.get(`${this._config.apiUrl}/statistics-by-companies`, {params});
  }

  /**
   * Retrieves received offers' statistics
   */
  getReceivedOffersStatistics(activityName: number): Observable<ReceivedOffersStatistics[]> {
    return this._http.get(`${this._config.apiUrl}/statistics-by-products?activityName=${activityName}`)
      .pipe(
        map((res) => {
          const arr: ReceivedOffersStatistics[] = [];

          for (const key in res) {
            arr.push(res[key]);
          }

          return arr;
        }));
  }

  /**
   * Sets selected received offers' statistics email as viewed
   */
  setReceivedOffersStatisticEmailsAsViewed(data: {email: string, ids: string}): Observable<any> {
    return this._http.post(`${this._config.apiUrl}/statistics-view`, {...data});
  }
}
