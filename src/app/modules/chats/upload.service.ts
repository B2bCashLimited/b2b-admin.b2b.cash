import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {ConfigService} from '@b2b/services/config.service';

@Injectable()
export class UploadService {

  constructor(private _http: HttpClient,
              private _config: ConfigService) {
  }

  /**
   * Retrieves available units
   */
  uploadImage(data: any): Observable<any> {
    const url = `${this._config.apiUrl}/upload/img`;

    return this._http.post(url, data);
  }

  /**
   * Retrieves available units
   */
  uploadDocument(data: any): Observable<any> {
    const url = `${this._config.apiUrl}/upload/document`;

    return this._http.post(url, data);
  }

}
