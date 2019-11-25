import { Injectable } from '@angular/core';
import { ConfigService } from '@b2b/services/config.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  constructor(
    private _config: ConfigService,
    private _http: HttpClient
  ) { }

  /**
   * add category seo meta data
   */
  addCategoryMetaData(body: any): Observable<any> {
    return this._http.post(`${this._config.apiUrl}/seo-categories`, body);
  }
  updateCategoryMetaData(id: number, body: any) {
    return this._http.put(`${this._config.apiUrl}/seo-categories/${id}`, body);
  }

  deleteCategoryMetaDataRecord(id: number) {
    return this._http.delete(`${this._config.apiUrl}/seo-categories/${id}`);
  }

  /**
   * get category seo meta data
   */
  getCategoryMetaData(category: number, type: number) {
    const obj = {
      'filter[0][type]': 'eq',
      'filter[0][field]': 'category',
      'filter[0][value]': `${category}`,
      'filter[1][type]': 'eq',
      'filter[1][field]': 'type',
      'filter[1][value]': `${type}`,
      'order-by[0][type]': 'field',
      'order-by[0][field]': 'id',
      'order-by[0][direction]': 'asc'
    };
    const params = new HttpParams({ fromObject: obj });

    return this._http.get(`${this._config.apiUrl}/seo-categories`, { params });
    /*.pipe(
      map((res: any) => {
        const data: any[] = [];
        console.log('all', res._embedded);
        return res;
        res._embedded['seo-category'].forEach((item) => {
          data.push({
            type: item.type,
            id: item.id,
            header: {
              nameRu: item.headerNameRu,
              nameEn: item.headerNameEn,
              nameCn: item.headerNameCn,
            },
            metaDesc: {
              nameRu: item.metaDescNameRu,
              nameEn: item.metaDescNameEn,
              nameCn: item.metaDescNameCn,
            },
            title: {
              nameRu: item.titleNameRu,
              nameEn: item.titleNameEn,
              nameCn: item.titleNameCn,
            },
            keywords: {
              nameRu: item.keywordsNameRu,
              nameEn: item.keywordsNameEn,
              nameCn: item.keywordsNameCn,
            },
            description: {
              nameRu: item.descriptionNameRu,
              nameEn: item.descriptionNameEn,
              nameCn: item.descriptionNameCn,
            }
          });
        });

        return data[0];
      }));*/
  }

  findSeoMetaData(categoryId: number, type: number, props: string, flex = true) {
    const params = {
      categoryId: `${categoryId}`,
      type: `${type}`,
      properties: props,
      strict: '1',     // строгий поиск по указанным пропертям (без расширения поиска)
      flexible: flex ? '1' : '0'
    };
    return this._http.get(`${this._config.apiUrl}/find-seo-metadata`, {params: params}).pipe(map((value: any) => {
      return {
        id: value.id,
        header: {
          nameRu: value.headerNameRu,
          nameEn: value.headerNameEn,
          nameCn: value.headerNameCn,
        },
        metaDesc: {
          nameRu: value.metaDescNameRu,
          nameEn: value.metaDescNameEn,
          nameCn: value.metaDescNameCn,
        },
        title: {
          nameRu: value.titleNameRu,
          nameEn: value.titleNameEn,
          nameCn: value.titleNameCn,
        },
        keywords: {
          nameRu: value.keywordsNameRu,
          nameEn: value.keywordsNameEn,
          nameCn: value.keywordsNameCn,
        },
        description: {
          nameRu: value.descriptionNameRu,
          nameEn: value.descriptionNameEn,
          nameCn: value.descriptionNameCn
        }
      };
    }));
  }
}
