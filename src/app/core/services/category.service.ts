import { Injectable } from '@angular/core';
import { ConfigService } from '@b2b/services/config.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { Category, CategoryCsv, PagerModel } from '@b2b/models';
import { SocketService } from './socket.service';
import { isArray } from 'util';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  deleteModerated: Subject<number> = new Subject<number>();

  constructor(
    private _config: ConfigService,
    private _socketService: SocketService,
    private _http: HttpClient) {
  }

  getCategoriesTree(): Observable<any> {
    return this._http.get(`${this._config.apiUrl}/categories-tree`)
      .pipe(
        map((res: any) => res._embedded.categories)
      );
  }

  clearCache(): Observable<any> {
    const url = `${this._config.apiUrl}/delete-dictionary-cache?url=/api/v1/categories-tree-products`;
    return this._http.get(url);
  }

  getLastCategories(name = '', page = 1, limit = 25): Observable<any> {
    const obj: any = { name, page, limit };
    const params = new HttpParams({ fromObject: obj });

    return this._http.get(`${this._config.apiUrl}/last-categories`, { params })
      .pipe(
        map((res: any) => {
          const categories = res._embedded.categories;
          categories.forEach(item => item.id = +item.id);
          return {
            page: res.page,
            pageCount: res.page_count,
            pageSize: res.page_size,
            totalItems: res.total_items,
            categories,
          };
        })
      );
  }

  getCountInProductProperty(propertyId: number) {
    const obj: any = {
      categoryProperty: propertyId
    };
    const params = new HttpParams({ fromObject: obj });
    return this._http.get(`${this._config.apiUrl}/count-in-product-property`, { params });
  }

  overrideProductProperty(body: any) {
    return this._http.put(`${this._config.apiUrl}/override-product-property`, body);
  }

  overrideProductPropertyValue(body: any) {
    return this._http.put(`${this._config.apiUrl}/override-product-property-value`, body);
  }

  removeProductProperties(body: any) {
    return this._http.put(`${this._config.apiUrl}/remove-product-properties`, body);
  }

  mergeProductProperties(body: any) {
    return this._http.put(`${this._config.apiUrl}/merge-product-properties`, body);
  }

  getCategories(name: string, page = 1, limit = 25): Observable<any> {
    const obj: any = {
      'filter[0][type]': 'lowerlike',
      'filter[0][where]': 'or',
      'filter[0][field]': 'nameRu',
      'filter[0][value]': `${name}%`,
      'filter[1][type]': 'lowerlike',
      'filter[1][where]': 'or',
      'filter[1][field]': 'nameEn',
      'filter[1][value]': `${name}%`,
      'filter[2][type]': 'lowerlike',
      'filter[2][where]': 'or',
      'filter[2][field]': 'nameCn',
      'filter[2][value]': `${name}%`,
      'filter[3][type]': 'lowerlike',
      'filter[3][where]': 'or',
      'filter[3][field]': 'nameRu',
      'filter[3][value]': `%${name}%`,
      'filter[4][type]': 'lowerlike',
      'filter[4][where]': 'or',
      'filter[4][field]': 'nameEn',
      'filter[4][value]': `%${name}%`,
      'filter[5][type]': 'lowerlike',
      'filter[5][where]': 'or',
      'filter[5][field]': 'nameCn',
      'filter[5][value]': `%${name}%`,
      'filter[6][type]': 'neq',
      'filter[6][field]': 'status',
      'filter[6][value]': '5',
      page,
      limit
    };
    const params = new HttpParams({ fromObject: obj });

    return this._http.get(`${this._config.apiUrl}/categories`, { params })
      .pipe(
        filter((res: any) => res && res._embedded),
        map((res: any) => {
          const categories = res._embedded.category as Category[];
          categories.forEach(item => item.id = +item.id);
          categories.sort((a, b) => {
            return a.nameRu.toLowerCase().indexOf(name.toLowerCase()) - b.nameRu.toLowerCase().indexOf(name.toLowerCase());
          });

          return {
            page: res.page,
            pageCount: res.page_count,
            pageSize: res.page_size,
            totalItems: res.total_items,
            categories,
          };
        })
      );
  }

  /**
   * Retrieves category's existed Tnvds and Etsngs
   */
  getCategoryTnvdsAndEtsngsById(categoryId: string): Observable<any> {
    return this._http.get(`${this._config.apiUrl}/categories/${categoryId}`)
      .pipe(
        map((res: any) => {
          return {
            tnveds: res._embedded.tnveds,
            etsngs: res._embedded.etsngs
          };
        })
      );
  }

  addCategory(body: any): Observable<any> {
    return this._http.post(`${this._config.apiUrl}/categories`, body);
  }

  moveCategory(category: number, assigneeCategoryId: number) {
    return this._http.post(`${this._config.apiUrl}/category-reassign`, {
      category, assigneeCategoryId
    }).pipe(
      switchMap((res: any) => {
        return this.updateCategory(assigneeCategoryId, res);
      })
    );
  }


  getCategoryById(id: number): Observable<any> {
    return this._http.get(`${this._config.apiUrl}/categories/${id}`)
      .pipe(
        map((res: any) => {
          res.categories = res._embedded.categories;
          res.etsngs = res._embedded.etsngs;
          res.orderForm = res._embedded.orderForm || {};
          res.orderPreview = res._embedded.orderPreview || {};
          res.orders = res._embedded.orders;
          res.properties = res._embedded.properties;
          res.showcases = res._embedded.showcases;
          res.tnveds = res._embedded.tnveds;
          delete res._embedded;
          return res;
        })
      );
  }

  /**
   * Retrieves categories by ids
   */
  getCategoriesByIds(ids: number[]): Observable<any> {
    const obj = {
      'filter[0][type]': 'in',
      'filter[0][field]': 'id',
      'limit': `${ids.length}`
    };
    ids.forEach((id, i) => {
      obj[`filter[0][values][${i}]`] = `${id}`;
    });
    const params = new HttpParams({ fromObject: obj });

    return this._http.get(`${this._config.apiUrl}/categories`, { params })
      .pipe(map((res: any) => {
        return res._embedded.category.map((category) => {
          category.orderForm = category._embedded && category._embedded.orderForm;
          category.orderPreview = category._embedded && category._embedded.orderPreview;
          category.orders = category._embedded && category._embedded.orders;
          category.properties = category._embedded && category._embedded.properties;
          category.showcases = category._embedded && category._embedded.showcases;
          category.etsngs = category._embedded && category._embedded.etsngs;
          category.tnveds = category._embedded && category._embedded.tnveds;
          return category;
        });
      }));
  }

  getCategoryByYandexId(yandexId): Observable<any> {
    const obj: any = {
      'filter[0][field]': 'yandexCategoryId',
      'filter[0][type]': 'eq',
      'filter[0][value]': `${yandexId}`,
      page: 1,
      limit: 1
    };
    // const params = new HttpParams({ fromObject: obj });
    return this._http.get(`${this._config.apiUrl}/categories`, { params: obj })
      .pipe(
        map((res: any) => {
          return res._embedded.category[0];
        })
      );
  }

  updateCategory(id: number, body: any): Observable<any> {
    return this._http.put(`${this._config.apiUrl}/categories/${id}`, body);
  }

  destroyCategory(id: number): Observable<any> {
    return this._http.delete(`${this._config.apiUrl}/categories/${id}`)
      .pipe(
        catchError(err => throwError(err))
      );
  }

  updatePropertyPriority(body: any, isOrder = false): Observable<any> {
    const params = new HttpParams({ fromObject: isOrder ? { 'type': 'order' } : {} });

    return this._http.post(`${this._config.apiUrl}/update-property-priority`, body, { params });
  }

  getOverrideProperties(): Observable<any> {
    return this._http.get(`${this._config.apiUrl}/override-properties`)
      .pipe(
        map((res: any) => {
          return {
            page: res.page,
            pageCount: res.page_count,
            pageSize: res.page_size,
            totalItems: res.total_items,
            overrideProperties: res._embedded.override_property,
          };
        })
      );
  }

  getCategoryProperties(id: number, page = 1, limit = 100) {
    const obj: any = {
      'filter[0][field]': 'useArea',
      'filter[0][type]': 'eq',
      'filter[0][value]': '2',
      'filter[1][type]': 'orx',
      'filter[1][conditions][0][field]': 'useArea',
      'filter[1][conditions][0][type]': 'eq',
      'filter[1][conditions][0][value]': '1',
      'filter[1][conditions][1][field]': 'orderEnabled',
      'filter[1][conditions][1][type]': 'eq',
      'filter[1][conditions][1][value]': '1',
      'filter[1][where]': 'or',
      'filter[2][type]': 'innerjoin',
      'filter[2][field]': 'category',
      'filter[2][alias]': 'c',
      'filter[3][type]': 'eq',
      'filter[3][field]': 'id',
      'filter[3][alias]': 'c',
      'filter[3][value]': id,
      'order-by[5][type]': 'field',
      'order-by[5][field]': 'orderPriority',
      'order-by[5][direction]': 'asc'
    };
    const params = new HttpParams({ fromObject: obj });

    return this._http.get(`${this._config.apiUrl}/category-properties`, { params })
      .pipe(
        map((res: any) => {
          return {
            page: res.page,
            pageCount: res.page_count,
            pageSize: res.page_size,
            totalItems: res.total_items,
            categoryProperties: res._embedded.category_property,
          };
        })
      );
  }

  getCategoryFeaturesProperties(id: number, page = 1, limit = 100) {
    const obj: any = {
      'filter[0][type]': 'innerjoin',
      'filter[0][field]': 'category',
      'filter[0][alias]': 'c',
      'filter[1][type]': 'eq',
      'filter[1][field]': 'id',
      'filter[1][alias]': 'c',
      'filter[1][value]': id,
      'filter[1][where]': 'and',
      'filter[2][type]': 'eq',
      'filter[2][field]': 'useArea',
      'filter[2][value]': '1',
      'filter[2][where]': 'and',
      'filter[3][type]': 'eq',
      'filter[3][field]': 'isDeleted',
      'filter[3][value]': '0',
      'order-by[4][type]': 'field',
      'order-by[4][field]': 'priority',
      'order-by[4][direction]': 'asc',
      'perPage': limit
    };
    const params = new HttpParams({ fromObject: obj });

    return this._http.get(`${this._config.apiUrl}/category-properties`, { params })
      .pipe(
        map((res: any) => {
          const categoryProperties = res._embedded.category_property;
          categoryProperties.forEach((category: any) => {
            if (category._embedded && category._embedded.controlUnitType) {
              category.controlUnitType = +category._embedded.controlUnitType.id;
            }
            if (category._embedded && category._embedded.unit) {
              category.unit = +category._embedded.unit.id;
            }
            delete category._embedded;
          });
          return {
            page: res.page,
            pageCount: res.page_count,
            pageSize: res.page_size,
            totalItems: res.total_items,
            categoryProperties,
          };
        })
      );
  }

  /**
   * copied from client
   */
  getMarketFilterCatProps(categoryId: number) {
    const obj = {
      'filter[0][type]': 'innerjoin',
      'filter[0][field]': 'category',
      'filter[0][alias]': 'c',
      'filter[1][type]': 'eq',
      'filter[1][field]': 'id',
      'filter[1][alias]': 'c',
      'filter[1][value]': `${categoryId}`,
      'filter[1][where]': 'and',
      'order-by[3][type]': 'field',
      'order-by[3][field]': 'priority',
      'order-by[3][direction]': 'asc',
      'filter[4][type]': 'eq',
      'filter[4][field]': 'enabled',
      'filter[4][value]': '1',
      'filter[4][where]': 'and',
      'filter[5][type]': 'eq',
      'filter[5][field]': 'useArea',
      'filter[5][value]': '1',
      'filter[6][type]': 'eq',
      'filter[6][field]': 'isDeleted',
      'filter[6][value]': '0',
      'perPage': '100'
    };
    const params = new HttpParams({ fromObject: obj });

    return this._http.get(`${this._config.apiUrl}/category-properties`, { params })
      .pipe(
        map((res: any) => {
          const properties = res._embedded.category_property;
          // save id as categoryProperty to use on showcases products
          properties.forEach((prop) => prop.categoryProperty = prop.id);
          return properties;
        }
        )
      );
  }

  getCategoryFeaturesBusinessProperties(id: number, page = 1, limit = 100) {
    const obj: any = {
      'filter[0][type]': 'eq',
      'filter[0][field]': 'category',
      'filter[0][value]': id
    };
    const params = new HttpParams({ fromObject: obj });

    return this._http.get(`${this._config.apiUrl}/business-properties`, { params })
      .pipe(
        map((res: any) => {
          return {
            page: res.page,
            pageCount: res.page_count,
            pageSize: res.page_size,
            totalItems: res.total_items,
            businessProperties: res._embedded.business_property,
          };
        })
      );
  }

  getFormOrderBusinessProperties(id: number, page = 1, limit = 100) {
    const obj: any = {
      'filter[0][type]': 'eq',
      'filter[0][field]': 'orderForm',
      'filter[0][value]': id
    };
    const params = new HttpParams({ fromObject: obj });

    return this._http.get(`${this._config.apiUrl}/order-form-business-properties`, { params })
      .pipe(
        map((res: any) => {
          return {
            page: res.page,
            pageCount: res.page_count,
            pageSize: res.page_size,
            totalItems: res.total_items,
            businessProperties: res._embedded.order_form_business_property,
          };
        })
      );
  }

  addFormOrderBusinessProperties(body: any) {
    return this._http.post(`${this._config.apiUrl}/order-form-business-properties`, body);
  }

  updateFormOrderBusinessProperties(id, body: any) {
    return this._http.put(`${this._config.apiUrl}/order-form-business-properties/${id}`, body);
  }

  deleteFormOrderBusinessProperties(id: number) {
    return this._http.delete(`${this._config.apiUrl}/order-form-business-properties/${id}`);
  }

  addCategoryProperty(body: any) {
    return this._http.post(`${this._config.apiUrl}/category-properties`, body);
  }

  updateCategoryProperties(id: number, body: any) {
    return this._http.put(`${this._config.apiUrl}/category-properties/${id}`, body)
      .pipe(
        map((property: any) => {
          if (property._embedded && property._embedded.controlUnitType) {
            property.controlUnitType = +property._embedded.controlUnitType.id;
          }
          if (property._embedded && property._embedded.unit) {
            property.unit = +property._embedded.unit.id;
          }
          delete property._embedded;
          return property;
        })
      );
  }

  destroyCategoryProperties(id: number) {
    return this._http.delete(`${this._config.apiUrl}/category-properties/${id}`);
  }

  getCategoryProperty(id: number) {
    return this._http.get(`${this._config.apiUrl}/category-properties/${id}`);
  }

  addCategoryFeaturesBusinessProperty(body: any) {
    return this._http.post(`${this._config.apiUrl}/business-properties`, body);
  }

  updateCategoryFeaturesBusinessProperty(id, body: any) {
    return this._http.put(`${this._config.apiUrl}/business-properties/${id}`, body);
  }

  deleteCategoryFeaturesBusinessProperty(id: number) {
    return this._http.delete(`${this._config.apiUrl}/business-properties/${id}`);
  }

  editCategoryMode(category: any, autoForm: boolean): Observable<any> {
    const body = {
      autoForm,
      nameRu: category.nameRu,
      nameEn: category.nameEn,
      nameCn: category.nameCn,
      parent: category.parent,
    };
    return this._http.put(`${this._config.apiUrl}/categories/${category.id}`, body);
  }

  getPumpingCategories(filters: any, page = 1, perPage = 25): Observable<any> {
    let obj: any = {
      'filter[0][field]': 'enabled',
      'filter[0][type]': 'eq',
      'filter[0][value]': 0,
      'order-by[1][type]': 'field',
      'order-by[1][field]': 'dateCreated',
      'order-by[1][direction]': 'asc',
      perPage,
      page
    };

    if (filters) {
      filters = this.getSearchFilter(filters);
      obj = { ...filters, ...obj };
    }
    const params = new HttpParams({ fromObject: obj });

    return this._http.get(`${this._config.apiUrl}/categories`, { params })
      .pipe(
        map((res: any) => {
          const categories = res._embedded.category;
          categories.forEach((category: any) => {
            category.dateCreated = category.dateCreated && category.dateCreated.date;
            category.properties = category._embedded && category._embedded.properties || [];
            category.properties.forEach(item => {
              item.possibleValuesRu = (item.possibleValuesRu || []).map(value => value.display).join(', ');
            });
            delete category._embedded;
          });
          return {
            page: res.page,
            pageCount: res.page_count,
            pageSize: res.page_size,
            totalItems: res.total_items,
            categories,
          };
        })
      );
  }

  private getSearchFilter(data) {
    let searchFilter = {};

    if (data.searchKey) {
      searchFilter = Object.assign({}, searchFilter, {
        'filter[2][type]': 'innerjoin',
        'filter[2][field]': 'proposedByCompany',
        'filter[2][alias]': 'c',
        'filter[3][type]': 'lowerlike',
        'filter[3][field]': 'nameRu',
        'filter[3][alias]': 'c',
        'filter[3][value]': `%${data.searchKey}%`,
        'filter[3][where]': 'or',
        'filter[4][type]': 'lowerlike',
        'filter[4][field]': 'nameEn',
        'filter[4][alias]': 'c',
        'filter[4][value]': `%${data.searchKey}%`,
        'filter[4][where]': 'or',
        'filter[5][type]': 'lowerlike',
        'filter[5][field]': 'nameCn',
        'filter[5][alias]': 'c',
        'filter[5][value]': `%${data.searchKey}%`,
        'filter[5][where]': 'or',
      });
    }


    if (data.categoryId) {
      searchFilter = Object.assign({}, searchFilter, {
        'filter[6][type]': 'eq',
        'filter[6][field]': 'id',
        'filter[6][value]': data.categoryId
      });
    }

    if (data.searchBySeen && !data.searchByNotSeen) {
      searchFilter = Object.assign({}, searchFilter, {
        'filter[1][field]': 'viewedByModerator',
        'filter[1][type]': 'eq',
        'filter[1][value]': 1
      });
    } else if (!data.searchBySeen && data.searchByNotSeen) {
      searchFilter = Object.assign({}, searchFilter, {
        'filter[1][field]': 'viewedByModerator',
        'filter[1][type]': 'eq',
        'filter[1][value]': 0
      });
    }

    return searchFilter;
  }

  getCategoryUsedCount(categoryId: number): Observable<any> {
    const obj: any = {
      'filter[0][type]': 'eq',
      'filter[0][field]': 'category',
      'filter[0][value]': categoryId,
      'filter[1][type]': 'neq',
      'filter[1][field]': 'deleted',
      'filter[1][value]': '1',
      'page': '1',
      'limit': '1',
    };
    const params = new HttpParams({ fromObject: obj });

    return this._http.get(`${this._config.apiUrl}/showcases`, { params })
      .pipe(
        map((res: any) => res.total_items)
      );
  }

  /**
   * Changes pumping category moderate status
   */
  changeCategoryModerateStatus(obj: any): Observable<any> {
    return this._http.post(`${this._config.apiUrl}/set-viewed-category`, obj);
  }

  downloadCsv(category: number): Observable<CategoryCsv[]> {
    const obj: any = {
      category,
      'target[0]': 'google',
      'target[1]': 'google-identity',
      'target[2]': 'yandex-xml',
      'target[3]': 'yandex-csv',
      'target[4]': 'k50'
    };
    const params = new HttpParams({ fromObject: obj });

    return this._http.get(`${this._config.apiUrl}/marketing-files`, { params })
      .pipe(map((res: CategoryCsv[]) => res));
  }

  moveProductsToCategory(body: any) {
    return this._http.post(`${this._config.apiUrl}/move-products-to-category`, body);
  }

  moderateFeedFieldsByName(body: any) {
    return this._http.post(`${this._config.apiUrl}/moderate-feed-fields-by-name`, body);
  }

  getImportModerates(query) {
    const obj: any = {};

    if (query) {
      if (query.status) {
        if (Array.isArray(query.status) && query.status.length) {
          query.status.forEach((st, i) => {
            obj[`status[${i}]`] = st;
          });
        } else if (Number.isInteger(query.status)) {
          obj[`status[]`] = query.status;
        }
      }
      if (query.type) {
        if (Array.isArray(query.type) && query.type.length) {
          query.type.forEach((st, i) => {
            obj[`type[${i}]`] = st;
          });
        } else if (Number.isInteger(query.type)) {
          obj[`type[]`] = query.type;
        }
      }
    }

    const params = new HttpParams({ fromObject: obj });

    return this._http.get(`${this._config.apiUrl}/get-import-moderates`, { params })
      .pipe(map((res: any) => {
        const data = res._embedded.import_moderates;
        return { pager: new PagerModel(res), data };
      }));
  }


  getUnmoderatedCategories(query: any) { // 1,5 - category | 2,6 - params | 7 - product names
    const obj: any = {};

    if (query) {
      if (query.status) {
        if (Array.isArray(query.status) && query.status.length) {
          obj[`filter[0][type]`] = 'in';
          obj[`filter[0][field]`] = 'status';
          query.status.forEach((val, idx) => {
            obj[`filter[0][values][${idx}]`] = val;
          });
        } else if (Number.isInteger(query.status)) {
          obj[`filter[0][type]`] = 'eq';
          obj[`filter[0][field]`] = 'status';
          obj[`filter[0][value]`] = `${query.status}`;
        }
      }

      if (query.type) {
        if (Array.isArray(query.type) && query.type.length) {
          obj[`filter[1][type]`] = 'in';
          obj[`filter[1][field]`] = 'type';
          query.type.forEach((val, idx) => {
            obj[`filter[1][values][${idx}]`] = val;
          });
        } else if (Number.isInteger(query.type)) {
          obj[`filter[1][type]`] = 'eq';
          obj[`filter[1][field]`] = 'type';
          obj[`filter[1][value]`] = `${query.type}`;
        }
      }

      if (query.feeds) {
        if (Array.isArray(query.feeds) && query.feeds.length) {
          obj[`filter[2][type]`] = 'in';
          obj[`filter[2][field]`] = 'feedId';
          query.feeds.forEach((val, idx) => {
            obj[`filter[2][values][${idx}]`] = val;
          });
        } else if (Number.isInteger(query.feeds)) {
          obj[`filter[2][type]`] = 'eq';
          obj[`filter[2][field]`] = 'feedId';
          obj[`filter[2][value]`] = `${query.feeds}`;
        }
      }

      if (query.category) {
        obj[`filter[3][type]`] = 'eq';
        obj[`filter[3][field]`] = 'categoryId';
        obj[`filter[3][value]`] = `${query.category}`;
      }
      obj.page = query.page || 1;
    }

    const params = new HttpParams({ fromObject: obj });

    return this._http.get(`${this._config.apiUrl}/import-moderates`, { params })
      .pipe(map((res: any) => {
        const data = res._embedded.import_moderates;
        return { pager: new PagerModel(res), data };
      }));
  }

  putImportModerates(id: number, body: any) {
    return this._http.put(`${this._config.apiUrl}/import-moderates/${id}`, body).pipe(
      map(res => {
        this.deleteModerated.next(null);
        return res;
      })
    );
  }

  updateImportModerates(id) {
    const body = { moderate: id };
    return this._http.put(`${this._config.apiUrl}/import-moderates-update`, body).pipe(
      map(res => {
        this.deleteModerated.next(id);
        return res;
      })
    );
  }

  getModerateCategories() {
    return this._http.get(`${this._config.apiUrl}/get-moderate-category`).pipe(
      map((categories: any[]) => {
        categories.forEach((item) => {
          item.id = +item.category;
        });
        return categories;
      })
    );
  }

  getCategoryPropertiesByYandexId(id) {
    const obj: any = {
      page: 1,
      'filter[0][type]': 'innerjoin',
      'filter[0][field]': 'category',
      'filter[0][alias]': 'c',
      'filter[1][type]': 'eq',
      'filter[1][field]': 'yandexCategoryId',
      'filter[1][alias]': 'c',
      'filter[1][value]': `${id}`,
      'filter[1][where]': 'and',
      'filter[2][type]': 'eq',
      'filter[2][field]': 'useArea',
      'filter[2][value]': '1',
      'filter[2][where]': 'and',
      'filter[3][type]': 'eq',
      'filter[3][field]': 'isDeleted',
      'filter[3][value]': '0',
      'order-by[4][type]': 'field',
      'order-by[4][field]': 'priority',
      'order-by[4][direction]': 'asc',
    };
    const params = new HttpParams({ fromObject: obj });
    return this._http.get(`${this._config.apiUrl}/category-properties`, { params })
      .pipe(map((res: any) => {
        const data = res._embedded.category_property;
        return { pager: new PagerModel(res), data };
      }));
  }

  getCategoryPropertiesByTaskId(id) {
    const obj: any = {
      page: 1,
      'filter[0][type]': 'innerjoin',
      'filter[0][field]': 'category',
      'filter[0][alias]': 'c',
      'filter[1][type]': 'eq',
      'filter[1][field]': 'taskId',
      'filter[1][alias]': 'c',
      'filter[1][value]': `${id}`,
      'filter[1][where]': 'and',
      'filter[2][type]': 'eq',
      'filter[2][field]': 'useArea',
      'filter[2][value]': '1',
      'filter[2][where]': 'and',
      'filter[3][type]': 'eq',
      'filter[3][field]': 'isDeleted',
      'filter[3][value]': '0',
      'order-by[4][type]': 'field',
      'order-by[4][field]': 'priority',
      'order-by[4][direction]': 'asc',
    };
    const params = new HttpParams({ fromObject: obj });
    return this._http.get(`${this._config.apiUrl}/category-properties`, { params })
      .pipe(map((res: any) => {
        const data = res._embedded.category_property;
        return { pager: new PagerModel(res), data };
      }));
  }

  moderateFeedItems(data: { moderate: number, type: number, bindId: number, task: number }) {
    return this._http.post(`${this._config.apiUrl}/moderate-feed-items`, data).pipe(
      map(res => {
        this.deleteModerated.next(data.moderate);
        return res;
      })
    );
  }

  moderateProductName(body) {
    return this._http.put(`${this._config.apiUrl}/moderate-product-name`, body);
  }

  searchImportModerateProducts(body) {
    return this._http.put(`${this._config.apiUrl}/search-import-moderate-products`, body);
  }

  addTask(body: any) {
    return this._http.post(`${this._config.apiUrl}/task`, body);
  }

  retrieveTasks(query: any) {
    const obj: any = {
      page: query.page,
      limit: query.limit || 25
    };
    let orderBy = 'desc';

    if (query) {
      if (query.status) {
        obj['filter[0][type]'] = 'eq';
        obj['filter[0][field]'] = 'status';
        obj['filter[0][value]'] = `${query.status}`;
      }

      if (query.type) {
        obj['filter[1][type]'] = 'eq';
        obj['filter[1][field]'] = 'type';
        obj['filter[1][value]'] = `${query.type}`;
      }

      if (query.feed) {
        obj['filter[2][type]'] = 'eq';
        obj['filter[2][field]'] = 'feed';
        obj['filter[2][value]'] = `${query.feed}`;
      }

      orderBy = query.orderBy || 'desc';
    }

    obj['order-by[0][type]'] = 'field';
    obj['order-by[0][field]'] = 'id';
    obj['order-by[0][direction]'] = `${orderBy}`;

    const params = new HttpParams({ fromObject: obj });
    return this._http.get(`${this._config.apiUrl}/task`, { params }).pipe(
      map((res: any) => {
        const data = res._embedded['cart'];

        return { pager: new PagerModel(res), data };
      })
    );
  }

  retrieveFeeds(query) {
    const obj: any = {};

    if (query) {
      if (query.status) {
        obj['filter[0][type]'] = 'eq';
        obj['filter[0][field]'] = 'status';
        obj['filter[0][value]'] = `${query.status}`;
      } else if (query.nonStatus) {
        obj['filter[0][type]'] = 'neq';
        obj['filter[0][field]'] = 'status';
        obj['filter[0][value]'] = `${query.nonStatus}`;
      }

      if (query.type) {
        obj['filter[1][type]'] = 'eq';
        obj['filter[1][field]'] = 'type';
        obj['filter[1][value]'] = `${query.type}`;
      }

      if (query.dateFrom) {
        obj['filter[2][type]'] = 'gte';
        obj['filter[2][field]'] = 'dateCreated';
        obj['filter[2][format]'] = 'Y-m-d';
        obj['filter[2][value]'] = `${query.dateFrom}`;
      }

      if (query.dateTo) {
        obj['filter[3][type]'] = 'lt';
        obj['filter[3][field]'] = 'dateCreated';
        obj['filter[3][format]'] = 'Y-m-d';
        obj['filter[3][value]'] = `${query.dateTo}`;
      }

      if (typeof query.structureStatus === 'number') {
        obj['filter[4][type]'] = 'eq';
        obj['filter[4][field]'] = 'structureStatus';
        obj['filter[4][value]'] = `${query.structureStatus}`;
      }
    }

    obj['order-by[0][type]'] = 'field';
    obj['order-by[0][field]'] = 'id';
    obj['order-by[0][direction]'] = query.orderBy ? `${query.orderBy}` : 'asc';
    obj['page'] = `${query.page}` || 1;
    obj['limit'] = `${query.limit}` || 25;

    const params = new HttpParams({ fromObject: obj });
    return this._http.get(`${this._config.apiUrl}/feed`, { params }).pipe(
      map((res: any) => {
        const data = res._embedded['feed'].map(item => {
          item.showcase = item.showcase || (item._embedded && item._embedded.showcase);
          item.fileUrl = item._embedded.file ? `${this._config.apiUrl.replace('/api/v1', '')}${item._embedded.file.url}` : null;
          item.fileName = item._embedded.file ? item._embedded.file.filename : null;
          return item;
        });

        return { pager: new PagerModel(res), data };
      })
    );
  }

  retrieveFeedProducts(query) {
    const obj: any = {};
    let orderBy = 'desc';

    if (query) {
      if (query.status) {
        obj['filter[0][type]'] = 'eq';
        obj['filter[0][field]'] = 'status';
        obj['filter[0][value]'] = `${query.status}`;
      } else if (query.nonStatus) {
        obj['filter[0][type]'] = 'neq';
        obj['filter[0][field]'] = 'status';
        obj['filter[0][value]'] = `${query.nonStatus}`;
      }

      if (query.type) {
        obj['filter[1][type]'] = 'eq';
        obj['filter[1][field]'] = 'type';
        obj['filter[1][value]'] = `${query.type}`;
      }

      if (query.feed) {
        obj['filter[2][type]'] = 'eq';
        obj['filter[2][field]'] = 'feed';
        obj['filter[2][value]'] = `${query.feed}`;
      }

      orderBy = query.orderBy || 'desc';
    }

    obj['order-by[0][type]'] = 'field';
    obj['order-by[0][field]'] = 'id';
    obj['order-by[0][direction]'] = `${orderBy}`;
    obj['page'] = `${query.page}` || 1;
    obj['limit'] = `${query.limit}` || 25;

    const params = new HttpParams({ fromObject: obj });
    return this._http.get(`${this._config.apiUrl}/feed-product`, { params }).pipe(
      map((res: any) => {
        const data = res._embedded['feed_product'].map(item => {
          // item.showcase = item.showcase || (item._embedded && item._embedded.showcase);
          return item;
        });

        return { pager: new PagerModel(res), data };
      })
    );
  }

  updateFeed(feedId: number, body: any) {
    return this._http.put(`${this._config.apiUrl}/feed/${feedId}`, body).pipe(
      map((res: any) => {
        res.fileUrl = res._embedded.file ? `${this._config.apiUrl.replace('/api/v1', '')}${res._embedded.file.url}` : null;
        res.fileName = res._embedded.file ? res._embedded.file.filename : null;
        res.showcase = res.showcase || (res._embedded && res._embedded.showcase);
        return res;
      })
    );
  }

  feedModerationNotification(feedId: number, body: any) {
    this._socketService.emit('feed_moderation', { feedId, moderationInfo: { missingProps: body } });
  }

  saveProductsFromFile(data: FormData): Observable<any> {
    return this._http.post(`${this._config.apiUrl}/reload-feed-file`, data);
  }
}
