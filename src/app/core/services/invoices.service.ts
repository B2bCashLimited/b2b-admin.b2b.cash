import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ConfigService } from '@b2b/services/config.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Document1C, Invoice, Settings } from '@b2b/models';

@Injectable({
  providedIn: 'root'
})
export class InvoicesService {

  constructor(private _http: HttpClient,
              private _config: ConfigService) {
  }

  /**
   * Retrieves invoices by filters
   */
  getInvoices(data: any = {}, page = 1, limit = 25): Observable<any> {
    let obj: any = {
      page,
      limit,
      'filter[0][type]': 'eq',
      'filter[0][field]': 'status',
      'filter[0][value]': 1,
      'order-by[0][type]': 'field',
      'order-by[0][field]': 'id',
      'order-by[0][direction]': 'desc'
    };

    if (data.dateFrom && data.dateTo) {
      obj = {
        ...obj,
        'filter[1][type]': 'gte',
        'filter[1][field]': 'dateProcessed',
        'filter[1][format]': 'Y-m-d',
        'filter[1][value]': `${data.dateFrom}`,
        'filter[2][type]': 'lt',
        'filter[2][field]': 'dateProcessed',
        'filter[2][format]': 'Y-m-d',
        'filter[2][value]': `${data.dateTo}`
      };
    }

    if (data.companyName) {
      obj = {
        ...obj,
        'filter[3][type]': 'innerjoin',
        'filter[3][field]': 'company',
        'filter[3][alias]': 'c',
        'filter[4][type]': 'lowerlike',
        'filter[4][field]': 'name',
        'filter[4][alias]': 'c',
        'filter[4][value]': `${data.companyName}`
      };
    }

    if (data.id) {
      obj = {
        ...obj,
        'filter[5][type]': 'eq',
        'filter[5][field]': 'id',
        'filter[5][value]': `${data.id}`
      };
    }

    const params = new HttpParams({fromObject: obj});
    return this._http.get(`${this._config.apiUrl}/invoices`, {params})
      .pipe(
        map((res: any) => {
          const invoices: Invoice[] = [];
          (res._embedded.invoice as Invoice[]).forEach(invoice => {
            const embeddedData = {...invoice._embedded};
            embeddedData.country.id = +embeddedData.country.id;
            embeddedData.company.id = +embeddedData.company.id;
            if (embeddedData.activityName) {
              embeddedData.activityName.id = +embeddedData.activityName.id;
            }
            delete invoice._embedded;
            invoices.push({
              ...invoice,
              ...embeddedData
            });
          });

          return {
            page: res.page,
            pageCount: res.page_count,
            pageSize: res.page_size,
            totalItems: res.total_items,
            invoices: invoices,
          };
        })
      );
  }

  /**
   * Deletes selected invoice by id
   */
  deleteInvoice(id: string): Observable<any> {
    return this._http.delete(`${this._config.apiUrl}/invoices/${id}`);
  }

  /**
   * Retrieves currencies
   */
  getCurrencies(): Observable<any> {
    const paramsStr = 'filter[0][type]=eq&filter[0][field]=controlUnitType&filter[0][value]=2';
    const params = new HttpParams({fromString: paramsStr});

    return this._http.get(`${this._config.apiUrl}/unit`, {params})
      .pipe(
        map((res: any) => res._embedded.unit)
      );
  }

  /**
   * Sets global params
   */
  setParams(data: {name: string, value: number} | {name: string, value: number}[]): Observable<any> {
    return this._http.post(`${this._config.apiUrl}/set-param`, data);
  }

  /**
   * Retrieves global settings
   */
  getGlobalSettings(): Observable<Settings[]> {
    return this._http.get(`${this._config.apiUrl}/settings`)
      .pipe(
        map((res: any) => res._embedded.settings as Settings[])
      );
  }

  /**
   * Retrieves documents' list imported from 1C
   */
  get1CDocuments(data: any, page = 1, limit = 25): Observable<any> {
    let obj: any = {
      page,
      limit
    };

    if (data.companyName) {
      obj = {
        ...obj,
        'filter[0][type]': 'lowerlike',
        'filter[0][where]': 'or',
        'filter[0][field]': 'companyName',
        'filter[0][value]': `%${data.companyName}%`
      };
    }

    if (data.dateFrom && data.dateTo) {
      obj = {
        ...obj,
        'filter[1][type]': 'gte',
        'filter[1][field]': 'dateImported',
        'filter[1][format]': 'Y-m-d H:i',
        'filter[1][value]': `${data.dateFrom}`,
        'filter[2][type]': 'lt',
        'filter[2][field]': 'dateImported',
        'filter[2][format]': 'Y-m-d H:i',
        'filter[2][value]': `${data.dateTo}`
      };
    }

    const params = new HttpParams({fromObject: obj});

    return this._http.get(`${this._config.apiUrl}/document1c`, {params})
      .pipe(
        map((res: any) => {
          const documents1C: Document1C[] = (res._embedded.document1c as Document1C[]).map(document => {
            const embeddedData = {...document._embedded};
            delete document._embedded;
            return {
              ...document,
              ...embeddedData
            };
          });
          delete res._embedded;

          return {
            ...res,
            documents1C
          };
        })
      );
  }
}
