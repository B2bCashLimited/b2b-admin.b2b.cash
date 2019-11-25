import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ConfigService} from '@b2b/services/config.service';

@Injectable({
  providedIn: 'root'
})
export class DeliveryTypesService {

  constructor(
    private _http: HttpClient,
    private _config: ConfigService) {
  }

  /**
   * Retrieves available customs delivery types
   */
  getDeliveryTypes(): Observable<any> {
    const url = `${this._config.apiUrl}/delivery-type`;

    return this._http.get(url)
      .pipe(
        map((res: any) => res._embedded.delivery_type)
      );
  }

}
