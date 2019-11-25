import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '@b2b/services/config.service';
import { map } from 'rxjs/operators';
import { RequisiteTemplate } from '@b2b/models';
import { removeEmptyProperties } from '@b2b/utils';

@Injectable({
  providedIn: 'root'
})
export class RequisiteTemplateService {

  constructor(private _http: HttpClient,
              private _config: ConfigService) {
  }

  /**
   * Retrieves requisite templates
   */
  getRequisiteTemplates(data: any, page = 1, limit = 25): Observable<any> {
    let obj: any = {
      'filter[0][type]': 'eq',
      'filter[0][field]': 'status',
      'filter[0][value]': 1,
      page,
      limit
    };

    if (data.country) {
      obj = {
        ...obj,
        'filter[1][type]': 'eq',
        'filter[1][field]': 'country',
        'filter[1][value]': data.country,
      };
    }

    if (data.name) {
      obj = {
        ...obj,
        'filter[2][type]': 'lowerlike',
        'filter[2][field]': 'name',
        'filter[2][value]': `%${data.name}%`,
      };
    }

    if (data.isAct) {
      obj = {
        ...obj,
        'filter[3][type]': 'eq',
        'filter[3][field]': 'isAct',
        'filter[3][value]': true,
      };
    }

    if (data.isInvoice) {
      obj = {
        ...obj,
        'filter[4][type]': 'eq',
        'filter[4][field]': 'isInvoice',
        'filter[4][value]': true,
      };
    }

    const params = new HttpParams({fromObject: obj});
    return this._http.get(`${this._config.apiUrl}/requisite`, {params})
      .pipe(map((res: any) => {
        const requisites: RequisiteTemplate[] = res._embedded.requisite;

        requisites.forEach(requisite => {
          requisite.country = requisite._embedded.country;
          requisite.companyRegion = requisite._embedded.companyRegion;
          requisite.companyCity = requisite._embedded.companyCity;
        });

        return {
          page: res.page,
          pageCount: res.page_count,
          pageSize: res.page_size,
          totalItems: res.total_items,
          requisites
        };
      }));
  }

  /**
   * Retrieves requisite template by given id
   */
  getRequisiteById(id: string): Observable<any> {
    return this._http.get(`${this._config.apiUrl}/requisite/${id}`)
      .pipe(
        map((res: RequisiteTemplate) => {
          const embeddedData = res._embedded;
          embeddedData.country.id = +embeddedData.country.id;
          delete res._embedded;

          return {
            ...res,
            ...embeddedData
          };
        })
      );
  }

  /**
   * Sets requisite for documents
   */
  setRequisite(data: any): Observable<any> {
    return this._http.post(`${this._config.apiUrl}/set-requisites`, data, {responseType: 'text'});
  }

  /**
   * Edits set requisite for documents
   */
  updateRequisite(data: any, id: string): Observable<any> {
    return this._http.put(`${this._config.apiUrl}/set-requisites/${id}`, data);
  }

  /**
   * Creates new requisite template
   */
  createRequisiteTemplate(body: any): Observable<RequisiteTemplate> {
    return this._http.post(`${this._config.apiUrl}/requisite`, removeEmptyProperties(body))
      .pipe(
        map((res: RequisiteTemplate) => {
          const embeddedData = res._embedded;
          delete res._embedded;

          return {
            ...res,
            ...embeddedData
          };
        })
      );
  }

  /**
   * Edits requisite template by id
   */
  editRequisiteTemplate(requisiteTemplateId: number, body: any): Observable<RequisiteTemplate> {
    return this._http.put(`${this._config.apiUrl}/requisite/${requisiteTemplateId}`, removeEmptyProperties(body))
      .pipe(
        map((res: RequisiteTemplate) => {
          const embeddedData = res._embedded;
          delete res._embedded;

          return {
            ...res,
            ...embeddedData
          };
        })
      );
  }

  /**
   * Deletes requisite template by id
   */
  deleteRequisiteTemplate(requisiteTemplateId: number): Observable<any> {
    return this._http.delete(`${this._config.apiUrl}/requisite/${requisiteTemplateId}`);
  }
}
