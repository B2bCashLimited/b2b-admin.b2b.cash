import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '@b2b/services/config.service';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  
  constructor(private _http: HttpClient,
              private _config: ConfigService) {
  }
  
  /**
   * Retrieves company by given id
   */
  getCompanyById(id: string): Observable<any> {
    return this._http.get(`${this._config.apiUrl}/companies/${id}`);
  }
}
