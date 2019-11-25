import {Injectable} from '@angular/core';
import {ConfigService} from '@b2b/services/config.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  constructor(
    private _config: ConfigService,
    private _http: HttpClient) {
  }

  addOrderForm(body: { category: number, enabled: boolean, status: number }): Observable<any> {
    return this._http.post(`${this._config.apiUrl}/order-forms`, body);
  }

  editOrderForm(id: number, body: { enabled: boolean }): Observable<any> {
    return this._http.put(`${this._config.apiUrl}/order-forms/${id}`, body);
  }

}
