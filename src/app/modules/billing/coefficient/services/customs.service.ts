import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {ConfigService} from '@b2b/services/config.service';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {ActivityNames} from '@b2b/enums';

@Injectable()
export class CustomsService {

  constructor(
    private _http: HttpClient,
    private _config: ConfigService) {
  }

  /**
   * Retrieves customs ports by given country, region or city
   */
  getCustomsPorts(id: number, field: 'country' | 'region' | 'city', limit = -1): Observable<any[]> {
    const url = `${this._config.apiUrl}/customs-ports`;
    const obj = {
      'filter[0][type]': 'eq',
      'filter[0][field]': `${field}`,
      'filter[0][value]': `${id}`,
      'limit': `${limit}`
    };
    const params = new HttpParams({fromObject: obj});

    return this._http.get(url, {params})
      .pipe(
        map((res: any) => res._embedded.customs_port)
      );
  }

  getPaymentTypeOptions(activityName, activity): any {
    if (activityName === ActivityNames.CustomsRepresentativeWithoutLicense) {
      return this.getCustomsWithoutLicenseById(activity);
    }
    if (activityName === ActivityNames.CustomsRepresentativeWithLicense) {
      return this.getCustomsBrokerById(activity);
    }
    return of(null);
  }

  haveCustomPartners(companyId: number) {
    const params = new HttpParams({fromObject: {company: `${companyId}`}});

    return this._http.get(`${this._config.apiUrl}/have-custom-partners`, {params})
      .pipe(
        map((res: any) => res.havePartner)
      );
  }

  /**
   * Retrieves available customs service types
   */
  getServiceTypes(): Observable<any[]> {
    return this._http.get(`${this._config.apiUrl}/service-types`)
      .pipe(
        map((res: any) => res._embedded.service_type)
      );
  }

  /**
   * Retrieves available customs delivery types
   */
  getDeliveryTypes(): Observable<any[]> {
    return this._http.get(`${this._config.apiUrl}/delivery-type`)
      .pipe(
        map((res: any) => res._embedded.delivery_type)
      );
  }

  getCustomRouteOrdersForCalculate(query) {
   /* const url = `${this._config.apiUrl}/get-custom-route-orders-for-calculate`;
    const params = new HttpParams({fromObject: query});

    return this._http.get(url, {params})
      .pipe(
        map((res: any) => {
          const data = res._embedded['get-custom-route-orders-for-calculate'];

          return {pager: new PagerModel(res), data};
        })
      );*/
  }

  addCalculatedOrder(body) {
    const url = `${this._config.apiUrl}/set-calculate-custom-order`;

    return this._http.post(url, body);
  }

  confirmCalculateCustomOrder(body) {
    const url = `${this._config.apiUrl}/confirm-calculate-custom-order`;

    return this._http.post(url, body);
  }

  /**
   * Retrieves published customs order
   */
  getCustomsWithoutLicenseById(id: number): Observable<any> {
    const url = `${this._config.apiUrl}/customs-without-license/${id}`;

    return this._http.get(url);
  }

  /**
   * Retrieves published customs order
   */
  getCustomsBrokerById(id: number): Observable<any> {
    const url = `${this._config.apiUrl}/customs-brokers/${id}`;

    return this._http.get(url);
  }

  /**
   * Retrieves published customs order
   */
  addCustomsBroker(body): Observable<any> {
    const url = `${this._config.apiUrl}/customs-brokers`;

    return this._http.post(url, body);
  }

  /**
   * Retrieves published customs order
   */
  updateCustomsBroker(id: number, body): Observable<any> {
    const url = `${this._config.apiUrl}/customs-brokers/${id}`;

    return this._http.put(url, body);
  }

  /**
   * Retrieves published customs order
   */
  updateCustomsWithoutLicense(id: number, body: any): Observable<any> {
    const url = `${this._config.apiUrl}/customs-without-license/${id}`;

    return this._http.put(url, body);
  }

  /**
   * Retrieves published customs order
   */
  addCustomsWithoutLicense(body: any): Observable<any> {
    const url = `${this._config.apiUrl}/customs-without-license`;

    return this._http.post(url, body);
  }

  /**
   * Retrieves published customs order
   */
  deleteCustomsRouteOrder(id: number): Observable<any> {
    const url = `${this._config.apiUrl}/custom-route-order/${id}`;

    return this._http.delete(url);
  }

  /**
   * Creates customs order in system
   */
  addCustomsRouteOrder(customRouteOrder: any): Observable<any> {
    const url = `${this._config.apiUrl}/custom-route-order`;

    return this._http.post(url, customRouteOrder);
  }

  updateCustomsRoute(id: number, body: any): Observable<any> {
    const url = `${this._config.apiUrl}/custom-route/${id}`;

    return this._http.put(url, body);
  }

  getCustomRouteById(id: number): Observable<any> {
    const url = `${this._config.apiUrl}/custom-route/${id}`;

    return this._http.get(url);
  }

  /**
   * Creates customs order in system
   */
  createCustomsRoute(body: any): Observable<any> {
    const url = `${this._config.apiUrl}/custom-route`;

    return this._http.post(url, body);
  }

  updateCustomsRouteOrder(id: number, body: any): Observable<any> {
    const url = `${this._config.apiUrl}/custom-route-order/${id}`;

    return this._http.put(url, body);
  }

}
