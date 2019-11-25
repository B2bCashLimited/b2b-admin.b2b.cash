import { Injectable } from '@angular/core';
import { ConfigService } from '@b2b/services/config.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { PagerModel } from '@b2b/models';
import { utc } from 'moment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(
    private _config: ConfigService,
    private _http: HttpClient) {
  }

  getFreeOrder(id) {
    return this._http.get(`${this._config.apiUrl}/free-order/${id}`).pipe(
      map((res: any) => {
        res.brutMe = res.brutMe || res._embedded.brutMe;
        res.countMe = res.countMe || res._embedded.countMe;
        res.netMe = res.netMe || res._embedded.netMe;
        res.parent = res.parent || res._embedded.parent;
        res.paymentOption = res.paymentOption || res._embedded.paymentOption;
        res.pickupCity = res.pickupCity || res._embedded.pickupCity;
        res.products = res.products || res._embedded.products;
        res.volumeMe = res.volumeMe || res._embedded.volumeMe;

        return res;
      })
    );
  }

  retrieveFreeProduct(query) {
    const params = new HttpParams({ fromObject: this.getHttpParam(query) });

    return this._http.get(`${this._config.apiUrl}/free-product`, { params })
      .pipe(
        map((res: any) => {
          const data = res._embedded.free_product;

          return { pager: new PagerModel(res), data };
        }));
  }

  getRawFreeOrders(query: any) {
    const params = new HttpParams({ fromObject: query });

    return this._http.get(`${this._config.apiUrl}/get-raw-free-orders`, { params })
      .pipe(
        map((res: any) => {
          const data = res._embedded['free-orders'];
          data.forEach((item) => {
            item.deliveryAddress = item.deliveryAddress || item._embedded.deliveryAddress;
            item.pickupCity = item.pickupCity || item._embedded.pickupCity;
            if (item.deliveryAddress) {
              item.deliveryAddress.locality = item.deliveryAddress.locality || item.deliveryAddress._embedded.locality;
              item.deliveryAddress.region = item.deliveryAddress.region || item.deliveryAddress.locality &&
                (item.deliveryAddress.locality.region || item.deliveryAddress.locality._embedded.region);
              item.deliveryAddress.country = item.deliveryAddress.country || item.deliveryAddress.region &&
                (item.deliveryAddress.region.country || item.deliveryAddress.region._embedded.country);
            }

            if (item.pickupCity) {
              item.pickupCity.region = item.pickupCity.region || item.deliveryAddress.pickupCity._embedded.region;
              item.pickupCity.country = item.pickupCity.region && (item.pickupCity.region.country ||
                item.pickupCity.region._embedded.country);
            }

            if (item.dateCreated && item.dateCreated.date) {
              item.dateCreated.date = utc(item.dateCreated.date).local().format();
            }
            if (item.dateExpired && item.dateExpired.date) {
              item.dateExpired.date = utc(item.dateExpired.date).local().format();
            }
            if (item.dateUpdated && item.dateUpdated.date) {
              item.dateUpdated.date = utc(item.dateUpdated.date).local().format();
            }

            item.brutMe = item.brutMe || item._embedded.brutMe;
            item.countMe = item.countMe || item._embedded.countMe;
            item.deliveryPriceMe = item.deliveryPriceMe || item._embedded.deliveryPriceMe;
            item.netMe = item.netMe || item._embedded.netMe;
            item.paymentOption = item.paymentOption || item._embedded.paymentOption;
            item.volumeMe = item.volumeMe || item._embedded.volumeMe;
            item.pickupCity = item.pickupCity || item._embedded.pickupCity;

            item.isCombined = !item.category && item.childFreeOrders && !!item.childFreeOrders.length;
            if (item.isCombined) {
              item.childFreeOrders = item.childFreeOrders.map(el => {
                el.orderId = el.freeOrderId;
                el.category = {
                  id: el.categoryId,
                  nameRu: el.categoryNameRu,
                  nameEn: el.categoryNameEn,
                  nameCn: el.categoryNameCn,
                };
                return el;
              });
            }
            return item;
          });

          return { pager: new PagerModel(res), data };
        })
      );
  }

  updateFreeOrder(body) {
    return this._http.post(`${this._config.apiUrl}/moderate-free-order`, body);
  }

  removeFreeOrder(id) {
    return this._http.delete(`${this._config.apiUrl}/free-order/${id}`);
  }

  private getHttpParam(query: any): { [key: string]: string } {
    const obj = {};
    const orderBy = 'desc';
    if (query && Object.keys(query).length > 0) {
      if (query.freeOrder) {
        obj['filter[0][type]'] = 'eq';
        obj['filter[0][field]'] = 'freeOrder';
        obj['filter[0][value]'] = `${query.freeOrder}`;
      }

      if (query.userCart) {
        obj['filter[0][type]'] = 'eq';
        obj['filter[0][field]'] = 'userCart';
        obj['filter[0][value]'] = `${query.userCart}`;
      }

      obj['page'] = `${query.page}` || 1;
      obj['limit'] = `${query.limit}` || 25;
      obj['order-by[0][type]'] = 'field';
      obj['order-by[0][field]'] = 'id';
      obj['order-by[0][direction]'] = `${orderBy}`;
    }

    return obj;
  }
}
