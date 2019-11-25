import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ConfigService } from '@b2b/services/config.service';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ActivityNames } from '@b2b/enums';
import { toPercent, toCoefficient } from '@b2b/utils';
import { SocketService } from './socket.service';
import { cloneDeep } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class BillingService {

  constructor(
    private _http: HttpClient,
    private _socketService: SocketService,
    private _config: ConfigService) {
  }

  getTariffRoutes(query: any): Observable<any> {
    const obj: any = {};
    if (query) {
      if (query.activityName) {
        obj['filter[0][type]'] = 'eq';
        obj['filter[0][field]'] = 'activityName';
        obj['filter[0][value]'] = `${query.activityName}`;
      }

      if (query.tariff) {
        obj['filter[1][type]'] = 'eq';
        obj['filter[1][field]'] = 'tariff';
        obj['filter[1][value]'] = `${query.tariff}`;
      }

      if (query.category) {
        obj['filter[2][type]'] = 'eq';
        obj['filter[2][field]'] = 'category';
        obj['filter[2][value]'] = `${query.category}`;
      }

      if (query.tariffCoefficient) {
        obj['filter[2][type]'] = 'eq';
        obj['filter[2][field]'] = 'tariffCoefficient';
        obj['filter[2][value]'] = `${query.tariffCoefficient}`;
      }

      if (query.hasDelivery) {
        obj['filter[3][type]'] = 'isNotNull';
        obj['filter[3][field]'] = 'countryFrom';
        obj['filter[4][type]'] = 'isNotNull';
        obj['filter[4][field]'] = 'countryTo';
        obj['filter[5][type]'] = 'isNotNull';
        obj['filter[5][field]'] = 'deliveryType';
      } else {
        obj['filter[3][type]'] = 'isNull';
        obj['filter[3][field]'] = 'countryFrom';
        obj['filter[4][type]'] = 'isNull';
        obj['filter[4][field]'] = 'countryTo';
        obj['filter[5][type]'] = 'isNull';
        obj['filter[5][field]'] = 'deliveryType';
      }
    }

    const params = new HttpParams({ fromObject: obj });

    return this._http.get(`${this._config.apiUrl}/tariff-routes`, { params })
      .pipe(
        map((res: any) => {
          return {
            page: res.page,
            pageCount: res.page_count,
            pageSize: res.page_size,
            totalItems: res.total_items,
            tariffRoutes: res._embedded.tariff_routes.map((item) => normalizeResp(item))
          };
        })
      );
  }

  createTariffRoute(body: any): Observable<any> {
    if (body.coefficient) {
      body.coefficient = toCoefficient(+body.coefficient);
    }

    if (body.rates && body.rates.length > 0) {
      const rates = cloneDeep(body.rates);

      for (let i = 0; i < rates.length; i++) {
        rates[i].rate = +toCoefficient(+rates[i].rate).toFixed(4);
      }

      body.rates = rates;
    }

    return this._http.post(`${this._config.apiUrl}/tariff-routes`, body).pipe(
      map((res: any) => {
        this._socketService.emit('tariff_update', { tariffRouteId: res.id });
        return normalizeResp(res);
      })
    );
  }

  getTariffRoute(id: number): Observable<any> {
    return this._http.get(`${this._config.apiUrl}/tariff-routes/${id}`).pipe(
      map((res: any) => normalizeResp(res))
    );
  }

  updateTariffRoute(id: number, body: any): Observable<any> {
    if (body.coefficient) {
      body.coefficient = toCoefficient(+body.coefficient);
    }

    if (body.rates && body.rates.length > 0) {
      const rates = cloneDeep(body.rates);

      for (let i = 0; i < rates.length; i++) {
        rates[i].rate = +toCoefficient(+rates[i].rate).toFixed(4);
      }

      body.rates = rates;
    }

    return this._http.put(`${this._config.apiUrl}/tariff-routes/${id}`, body).pipe(
      map((res: any) => {
        this._socketService.emit('tariff_update', { tariffRouteId: res.id });
        return normalizeResp(res);
      })
    );
  }

  deleteTariffRoute(id: number): Observable<any> {
    return this._http.delete(`${this._config.apiUrl}/tariff-routes/${id}`).pipe(
      map(() => {
        this._socketService.emit('tariff_update', { tariffRouteId: id });
      })
    );
  }

  getBaseTariffs(query: any): Observable<any> {
    const obj = {};
    if (query.activityName) {
      obj['filter[0][type]'] = 'eq';
      obj['filter[0][field]'] = 'activityName';
      obj['filter[0][value]'] = query.activityName;
    }

    if (query.notCountry) {
      obj['filter[1][type]'] = 'isNull';
      obj['filter[1][field]'] = 'country';
    }

    const params = new HttpParams({ fromObject: obj });

    return this._http.get(`${this._config.apiUrl}/tariff-base`, { params })
      .pipe(
        map((res: any) => {
          const tariffBases = res._embedded.tariff_base;
          tariffBases.forEach(item => {
            item.activityName = item._embedded.activityName && item._embedded.activityName.id;
            item.country = item._embedded.country && item._embedded.country.id;
            item.currency = item._embedded.currency && item._embedded.currency.id;
            delete item._embedded;
          });
          return {
            page: res.page,
            pageCount: res.page_count,
            pageSize: res.page_size,
            totalItems: res.total_items,
            tariffBases,
          };
        })
      );
  }

  createBaseTariff(body: any): Observable<any> {
    return this._http.post(`${this._config.apiUrl}/tariff-base`, body)
      .pipe(
        map((res: any) => {
          res.activityName = res._embedded.activityName;
          res.country = res._embedded.country;
          res.currency = res._embedded.currency;
          this._socketService.emit('tariff_update', { tariffBaseId: res.id });
          delete res._embedded;
          return res;
        })
      );
  }

  getBaseTariff(id: number): Observable<any> {
    return this._http.get(`${this._config.apiUrl}/tariff-base/${id}`);
  }

  updateTariffBase(id: number, body: any): Observable<any> {
    return this._http.put(`${this._config.apiUrl}/tariff-base/${id}`, body)
      .pipe(
        map((res: any) => {
          res.activityName = res._embedded.activityName;
          res.country = res._embedded.country;
          res.currency = res._embedded.currency;
          this._socketService.emit('tariff_update', { tariffBaseId: res.id });
          delete res._embedded;
          return res;
        })
      );
  }

  deleteTariffBase(id: number): Observable<any> {
    return this._http.delete(`${this._config.apiUrl}/tariff-base/${id}`).pipe(
      map(() => {
        this._socketService.emit('tariff_update', { baseTariffId: id });
      })
    );
  }

  getTariffs(query: any): Observable<any> {
    const params = new HttpParams({ fromObject: normalizeQuery(query) });

    return this._http.get(`${this._config.apiUrl}/tariffs`, { params })
      .pipe(
        map((res: any) => {
          const tariffs = res._embedded.tariff_coefficient.map(item => normalizeTariff(item));
          return {
            page: res.page,
            pageCount: res.page_count,
            pageSize: res.page_size,
            totalItems: res.total_items,
            tariffs,
          };
        })
      );
  }

  createTariff(body: any): Observable<any> {
    if (body.coefficient) {
      body.coefficient = toCoefficient(+body.coefficient);
    }

    return this._http.post(`${this._config.apiUrl}/tariffs`, body)
      .pipe(
        map((res: any) => {
          this._socketService.emit('tariff_update', { tariffCoefficientId: res.id });
          return normalizeTariff(res);
        }),
        catchError((err) => {
          throw err.error;
        })
      );
  }

  getTariff(id: number): Observable<any> {
    return this._http.get(`${this._config.apiUrl}/tariffs/${id}`)
      .pipe(
        map((res: any) => {
          if (res.coefficient) {
            res.coefficient = toPercent(+res.coefficient);
          }
          res.activityName = res._embedded.activityName;
          res.country = res._embedded.country.id;
          res.currency = res._embedded.currency;
          res.locality = res._embedded.locality && res._embedded.locality.id;
          res.region = res._embedded.region && res._embedded.region.id;
          res.tariff = res._embedded.tariff;
          delete res._embedded;
          return res;
        })
      );
  }

  updateTariff(id: number, body: any): Observable<any> {
    if (body.coefficient) {
      body.coefficient = toCoefficient(+body.coefficient);
    }

    if (body.rates && body.rates.length > 0) {
      const rates = cloneDeep(body.rates);

      for (let i = 0; i < rates.length; i++) {
        rates[i].rate = +toCoefficient(+rates[i].rate).toFixed(4);
      }

      body.rates = rates;
    }

    return this._http.put(`${this._config.apiUrl}/tariffs/${id}`, body).pipe(
      map((res: any) => {
        if (!!body.isPrepayment) {
          this._socketService.emit('tariff_pre_update', { tariffId: res.id });
        } else {
          this._socketService.emit('tariff_update', { tariffCoefficientId: res.id });
          this._socketService.emit('tariff_product_update', { tariffId: res.id });
        }

        return normalizeTariff(res);
      })
    );
  }

  deleteTariff(id: number): Observable<any> {
    return this._http.delete(`${this._config.apiUrl}/tariffs/${id}`)
      .pipe(map(() => this._socketService.emit('tariff_update', {tariffCoefficientId: id})));
  }
}

function normalizeTariff(item: any) {
  const embedded = item._embedded;

  if (item.coefficient) {
    item.coefficient = toPercent(item.coefficient);
  }

  if (item.rates && item.rates.length > 0) {
    (item.rates as any[]).forEach(value => value.rate = +toPercent(+value.rate).toFixed(4));
  }

  item.activityName = embedded.activityName;
  item.category = embedded.category;
  item.country = embedded.country;
  item.currency = embedded.currency;
  item.isFixed = item.isFixed ? 1 : 0;
  item.isPrepayment = item.isPrepayment ? 1 : 0;
  item.locality = embedded.locality;
  item.region = embedded.region;
  item.tariff = embedded.tariff;
  item.hasCoefficient = [
    ActivityNames.Buyer,
    ActivityNames.Supplier,
    ActivityNames.ProducerFactory,
    // ActivityNames.CustomsRepresentativeWithoutLicense,
    // ActivityNames.CustomsRepresentativeWithLicense
  ].includes(+item.activityName.id);

  return item;
}

function normalizeResp(item: any) {
  const embedded = item._embedded;
  item.activityName = item.activityName || embedded.activityName;
  item.category = item.category || embedded.category;
  item.countryFrom = item.countryFrom || embedded.countryFrom;
  item.countryTo = item.countryTo || embedded.countryTo;
  item.localityFrom = item.localityFrom || embedded.localityFrom;
  item.localityTo = item.localityTo || embedded.localityTo;
  item.regionFrom = item.regionFrom || embedded.regionFrom;
  item.regionTo = item.regionTo || embedded.regionTo;
  item.currency = item.currency || embedded.currency;
  item.deliveryType = item.deliveryType || embedded.deliveryType;
  item.tariff = item.tariff || embedded.tariff;
  if (item.coefficient) {
    item.coefficient = toPercent(item.coefficient);
  }

  if (item.rates && item.rates.length > 0) {
    (item.rates as any[]).forEach(value => value.rate = +toPercent(+value.rate).toFixed(4));
  }

  ['loadingAirport', 'unloadingAirport',
    'loadingRiverport', 'unloadingRiverport',
    'loadingStation', 'unloadingStation',
    'loadingSeaport', 'unloadingSeaport'].forEach((key) => {
      item[key] = item[key] || item._embedded[key] || null;
      if (item[key]) {
        item[key].country = item[key].country || item[key]._embedded && item[key]._embedded.country || null;
        item[key].region = item[key].region || item[key]._embedded && item[key]._embedded.region || null;
      }
    });

  return item;
}

function normalizeQuery(query: any): { [key: string]: string } {
  const obj = {};

  if (query) {
    if (query.activityName) {
      obj['filter[0][type]'] = 'eq';
      obj['filter[0][field]'] = 'activityName';
      obj['filter[0][value]'] = query.activityName;
      obj['filter[2][type]'] = 'isNull';
      obj['filter[2][field]'] = 'region';
      obj['filter[3][type]'] = 'isNull';
      obj['filter[3][field]'] = 'locality';
    }

    if (query.country) {
      obj['filter[1][type]'] = 'eq';
      obj['filter[1][field]'] = 'country';
      obj['filter[1][value]'] = query.country;
      if (!query.isCoefficient) {
        obj['filter[2][type]'] = 'isNotNull';
        obj['filter[2][field]'] = 'region';
      }

      if (query.region) {
        obj['filter[2][type]'] = 'eq';
        obj['filter[2][field]'] = 'region';
        obj['filter[2][value]'] = query.region;
        if (!query.isCoefficient) {
          obj['filter[3][type]'] = 'isNotNull';
          obj['filter[3][field]'] = 'locality';
        }

        if (query.locality) {
          obj['filter[3][type]'] = 'eq';
          obj['filter[3][field]'] = 'locality';
          obj['filter[3][value]'] = query.locality;
        }
      }
    }

    if (query.isCoefficient) {
      obj['filter[4][type]'] = 'isNotNull';
      obj['filter[4][field]'] = 'category';
    } else {
      obj['filter[4][type]'] = 'isNull';
      obj['filter[4][field]'] = 'category';
    }

    if (query.serviceType) {
      obj['filter[5][type]'] = 'eq';
      obj['filter[5][field]'] = 'serviceType';
      obj['filter[5][value]'] = `${query.serviceType}`;
    }
  }

  obj['page'] = `${query.page}` || 1;
  obj['limit'] = `${query.limit}` || 25;

  return Object.keys(obj).sort().reduce((result, key) => {
    result[key] = obj[key];
    return result;
  }, {});
}
