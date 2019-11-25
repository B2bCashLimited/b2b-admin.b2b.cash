import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {ConfigService} from '@b2b/services/config.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {TypeId} from '@b2b/enums';

@Injectable()
export class TransportsService {

  constructor(
    private _http: HttpClient,
    private _config: ConfigService) {
  }

  /**
   * Retrieves available transports by given type id
   */
  getTransports(typeId: number, limit = -1): Observable<any[]> {
    const url = `${this._config.apiUrl}/transports`;
    const obj = {
      'filter[0][type]': 'eq',
      'filter[0][field]': 'type',
      'filter[0][value]': `${typeId}`,
      'limit': `${limit}`
    };
    const params = new HttpParams({fromObject: obj});

    return this._http.get(url, {params})
      .pipe(
        map((res: any) => res._embedded.transport)
      );
  }

  /**
   * Retrieves only air transports
   */
  getAirTransports(): Observable<any[]> {
    return this.getTransports(TypeId.TWO);
  }

  /**
   * Retrieves only sea transports
   */
  getSeaTransports(): Observable<any[]> {
    return this.getTransports(TypeId.ONE);
  }

  /**
   * Retrieves transport by given id
   */
  getTransportById(id: number): Observable<any> {
    return this._http.get(`${this._config.apiUrl}/transports/${id}`);
  }

  /**
   * Gets airports by given country id and query string
   */
  getAirports(id: number, field: 'country' | 'region' | 'city', limit = -1): Observable<any[]> {
    const url = `${this._config.apiUrl}/air-port`;
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
        map((res: any) => res._embedded.air_port)
      );
  }

  /**
   * Gets railway stations by given country, region and city id
   */
  getRailwayStations(id: number, field: 'country' | 'region' | 'city', limit = -1): Observable<any[]> {
    const url = `${this._config.apiUrl}/railway-station`;
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
        map((res: any) => res._embedded.railway_station)
      );
  }


}
