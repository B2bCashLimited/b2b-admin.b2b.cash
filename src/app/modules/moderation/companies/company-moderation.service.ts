import { Injectable } from '@angular/core';
import { ConfigService } from '@b2b/services/config.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class CompanyModerationService {

  constructor(private _http: HttpClient,
    private _config: ConfigService) {
  }

  getCompanies(filter: any, page: number = 1, limit = 15): Observable<any> {
    const obj = this.getCompanySearchParams(filter, page, limit);
    const params = new HttpParams({ fromObject: obj });

    return this._http.get(`${this._config.apiUrl}/companies`, { params })
      .pipe(
        map((res: any) => {
          const companies = res._embedded.company;
          companies.forEach((company: any) => {
            company.shortName = company.shortName || company.shortNameRu || company.shortNameEn || company.shortNameCn;
            const companyLogo = company.logo && company.logo[0];
            company.yearOfFound = company.yearOfFound && company.yearOfFound.date;
            if (companyLogo) {
              company.logo = this._config.serverUrl + companyLogo.link;
            } else {
              company.logo = null;
            }
          });
          return {
            companies,
            page: res.page,
            pageCount: res.page_count,
            pageSize: res.page_size,
            totalItems: res.total_items,
          };
        })
      );
  }

  getRatingTemplate(countryId: number): Observable<any> {
    const obj = {
      'filter[0][type]': 'eq',
      'filter[0][field]': 'activity',
      'filter[0][value]': '15',
      'filter[1][type]': 'eq',
      'filter[1][field]': 'country',
      'filter[1][value]': `${countryId}`
    };

    const params = new HttpParams({ fromObject: obj });

    return this._http.get(`${this._config.apiUrl}/rating-templates`, { params })
      .pipe(
        map((res: any) => res._embedded.rating_templates.pop())
      );
  }

  moderateCompany(companyId: number, action: string, message: string = ''): Observable<any> {
    const url = `${this._config.apiUrl}/moderateCompany/${companyId}`;

    return this._http.post(url, { action, message });
  }

  saveCompanyQuiz(body: any): Observable<any> {
    const url = `${this._config.apiUrl}/rating-answer-quiz`;

    return this._http.post(url, body);
  }

  getCompanyRatingQuizHistory(obj: any): Observable<any> {
    const url = `${this._config.apiUrl}/rating-quiz-history`;
    const params = new HttpParams({ fromObject: obj });

    return this._http.get(url, { params })
      .pipe(
        map((res: any) => res._embedded.rating_quz_history)
      );
  }

  getCompaniesCountByCountry(obj: any): Observable<any> {
    const params = new HttpParams({ fromObject: obj });

    return this._http.get(`${this._config.apiUrl}/count-of-companies-by-countries`, { params })
      .pipe(
        map((res: any) => {
          const countriesResult = [];
          obj.countries = JSON.parse(obj.countries);
          if (obj.countries[0] !== 0) {
            obj.countries.forEach((id: number) => {
              countriesResult.push({ id: id, count: res.companiesCounts[`country_id${id}`] || 0 });
            });
          }
          return countriesResult;
        })
      );
  }

  setBonusForCompanies(companyId: number[], amount: number): Observable<any> {
    const obj: any = {
      companyId,
      currencyId: 28,
      amount
    };

    return this._http.post(`${this._config.apiUrl}/make-gift`, obj);
  }

  private getCompanySearchParams(filter: any, page: number = 1, limit = 15): any {
    const obj = {
      'page': `${page}`,
      'limit': `${limit}`,
      'order-by[0][type]': 'field',
      'order-by[0][field]': `id`,
      'order-by[0][direction]': 'asc'
    };
    // filter index
    let ind = 0;

    // 1
    if (filter.search && filter.search) {
      obj[`filter[${ind}][field]`] = 'shortName';
      obj[`filter[${ind}][type]`] = 'lowerlike';
      obj[`filter[${ind}][where]`] = 'or';
      obj[`filter[${ind}][value]`] = `%${filter.search}%`;
      ind++;          // next filter index
      for (const lang of filter.languages) {
        obj[`filter[${ind}][field]`] = `name${lang}`;
        obj[`filter[${ind}][type]`] = 'lowerlike';
        obj[`filter[${ind}][where]`] = 'or';
        obj[`filter[${ind}][value]`] = `%${filter.search}%`;
        ind++;          // next filter index
      }
    }

    // 2
    if (filter.status !== -1) {
      obj[`filter[${ind}][where]`] = 'and';
      obj[`filter[${ind}][type]`] = 'eq';
      obj[`filter[${ind}][field]`] = 'status';
      obj[`filter[${ind}][value]`] = filter.status;
      ind++;          // next filter index
      obj[`filter[${ind}][where]`] = 'and';
      obj[`filter[${ind}][type]`] = 'eq';
      obj[`filter[${ind}][field]`] = 'individual';
      obj[`filter[${ind}][value]`] = '0';
      ind++;          // next filter index
    }

    const countriesIdLength = filter.countriesId && filter.countriesId.length;
    if (countriesIdLength && filter.countriesId[0] !== 0) {
      obj[`filter[${ind}][type]`] = 'orx';
      obj[`filter[${ind}][where]`] = 'and';
      filter.countriesId.forEach((id, index) => {
        obj[`filter[${ind}][conditions][${index}][field]`] = 'country';
        obj[`filter[${ind}][conditions][${index}][type]`] = 'eq';
        obj[`filter[${ind}][conditions][${index}][value]`] = `${id}`;
        if (countriesIdLength > 1) {
          obj[`filter[${ind}][conditions][${index}][where]`] = 'or';
        }
      });
      ind++;          // next filter index
    }

    return obj;
  }
}
