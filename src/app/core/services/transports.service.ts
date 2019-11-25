import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {ConfigService} from './config.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {
  Airports, Airport, RailwayStation, RailwayStations, CustomsPosts, CustomsPost, SeaPort, SeaPorts, RiverPort, RiverPorts
} from '@b2b/models';
import {isNumeric} from '@b2b/utils';

@Injectable({
  providedIn: 'root'
})
export class TransportsService {

  constructor(private _http: HttpClient,
              private _config: ConfigService) {
  }

  /**
   * Retrieve available countries
   */
  getSeaPorts(query: string, limit = -1): Observable<SeaPort[]> {
    const obj: any = this._getSearchFilters(query, limit);
    const params = new HttpParams({fromObject: obj});

    return this._http.get(`${this._config.apiUrl}/sea-port`, {params})
      .pipe(
        map((res: SeaPorts) => res._embedded.sea_port)
      );
  }

  /**
   * Retrieve available countries
   */
  getRiverPorts(query: string, limit = -1): Observable<RiverPort[]> {
    const obj: any = this._getSearchFilters(query, limit);
    const params = new HttpParams({fromObject: obj});

    return this._http.get(`${this._config.apiUrl}/river-port`, {params})
      .pipe(
        map((res: RiverPorts) => res._embedded.river_port)
      );
  }

  /**
   * Gets cities and regions by given query string
   */
  getCitiesAndRegions(query: string, countryId?: number): Observable<any> {
    const obj: any = {
      'q': `${query}`
    };

    if (isNumeric(countryId)) {
      obj['countryId'] = `${countryId}`;
    }

    const params = new HttpParams({fromObject: obj});

    return this._http.get(`${this._config.apiUrl}/search-city-and-region`, {params})
      .pipe(
        map((res: any) => {
          const localities = res.localities.data;
          const regions = res.regions.data;

          localities.forEach((item) => {
            item.fullName = `${item[this._config.name]}`;
            item.fullName += `${item.area ? '(' + item.area + ')' : ''}, `;
            item.fullName += `${item.region.country[this._config.name]}`;
          });

          regions.forEach((item) => {
            item.fullName = `${item[this._config.name]}, `;
            item.fullName += `${item.country[this._config.name]}`;
          });

          return [...regions, ...localities]
            .sort((a: any, b: any) => a.fullName - b.fullName);
        })
      );
  }

  /**
   * Gets airports by given country id and query string
   */
  getAirports(query: string, limit = -1): Observable<Airport[]> {
    const obj: any = this._getSearchFilters(query, limit, true);
    const params = new HttpParams({fromObject: obj});

    return this._http.get(`${this._config.apiUrl}/air-port`, {params})
      .pipe(
        map((res: Airports) => res._embedded.air_port)
      );
  }

  /**
   * Gets railway stations by given country, region and city id
   */
  getRailwayStations(query: string, limit = -1): Observable<RailwayStation[]> {
    const obj: any = this._getSearchFilters(query, limit);
    const params = new HttpParams({fromObject: obj});

    return this._http.get(`${this._config.apiUrl}/railway-station`, {params})
      .pipe(
        map((res: RailwayStations) => res._embedded.railway_station)
      );
  }

  /**
   * Retrieves customs posts by given country, region or city
   */
  getCustomsPorts(query: string, limit = -1): Observable<CustomsPost[]> {
    const obj: any = this._getSearchFilters(query, limit);
    const params = new HttpParams({fromObject: obj});

    return this._http.get(`${this._config.apiUrl}/customs-ports`, {params})
      .pipe(
        map((res: CustomsPosts) => res._embedded.customs_port)
      );
  }

  private _getSearchFilters(query: string, limit: number, isAirport = false): any {
    let obj: any = {
      'filter[0][type]': 'lowerlike',
      'filter[0][where]': 'or',
      'filter[0][field]': `nameRu`,
      'filter[0][value]': `%${query}%`,
      'filter[1][type]': 'lowerlike',
      'filter[1][where]': 'or',
      'filter[1][field]': `nameEn`,
      'filter[1][value]': `%${query}%`,
      'filter[2][type]': 'lowerlike',
      'filter[2][where]': 'or',
      'filter[2][field]': `nameCn`,
      'filter[2][value]': `%${query}%`,
      'filter[3][type]': 'lowerlike',
      'filter[3][where]': 'or',
      'filter[3][field]': `nameRu`,
      'filter[3][value]': `${query}%`,
      'filter[4][type]': 'lowerlike',
      'filter[4][where]': 'or',
      'filter[4][field]': `nameEn`,
      'filter[4][value]': `${query}%`,
      'filter[5][type]': 'lowerlike',
      'filter[5][where]': 'or',
      'filter[5][field]': `nameCn`,
      'filter[5][value]': `${query}%`,
      limit
    };

    if (isAirport) {
      obj = {
        ...obj,
        'filter[6][type]': 'lowerlike',
        'filter[6][where]': 'or',
        'filter[6][field]': 'iataCode',
        'filter[6][value]': query
      };
    }

    return obj;
  }
}
