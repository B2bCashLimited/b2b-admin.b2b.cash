import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ConfigService } from '@b2b/services/config.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DocumentsListService {
  
  constructor(private _http: HttpClient,
              private _config: ConfigService) {
  }
  
  /**
   * Retrieves documents list by filters
   */
  getDocumentsList(data: any, page = 1, limit = 25): Observable<any> {
    const obj: any = {
      ...data,
      page,
      limit
    };
    const params = new HttpParams({fromObject: obj});
    return this._http.get(`${this._config.apiUrl}/list-documents`, {params})
      .pipe(
        map((res: any) => {
          return {
            page: res.page,
            pageCount: res.page_count,
            pageSize: res.page_size,
            totalItems: res.total_items,
            listDocuments: res._embedded.list_documents
          };
        })
      );
  }
}
