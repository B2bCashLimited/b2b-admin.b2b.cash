import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ConfigService} from './config.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  
  constructor(private _http: HttpClient,
              private _config: ConfigService) {
  }

  /**
   * Uploads an image
   */
  uploadImage(data: any): Observable<any> {
    return this._http.post(`${this._config.apiUrl}/upload/img`, data);
  }

  /**
   * Uploads documents
   */
  uploadDocument(data: any): Observable<any> {
    return this._http.post(`${this._config.apiUrl}/upload/document`, data);
  }

}
