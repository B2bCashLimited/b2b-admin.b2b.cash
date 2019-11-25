import { Injectable } from '@angular/core';
import { ConfigService } from '@b2b/services/config.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Marketplace } from '@b2b/models/marketplace';
import { MarketCategory } from '@b2b/models/market-category';
import { SaveMarket } from '@b2b/models/save-market';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MarketplaceService {
   constructor( private _config: ConfigService,
    private _http: HttpClient
   ) {
   }

   public getMarketplaceList () {
       const url = this._config.apiUrl + '/marketplace';
       return this._http.get(url) .pipe(
        map((res: any) => res._embedded.marketplace as Marketplace[])
      );
   }

   public getSomeMarketplace(id): Observable<any> {
    const url = this._config.apiUrl + `/marketplace/${id}`;
    return this._http.get<any>(url);
     
  }

   public saveNewMarketplace (post: SaveMarket) {
    const url = this._config.apiUrl + `/marketplace`;
    return this._http.post(url, post);
   }

   public saveEditMarketplace (post: SaveMarket, id) {
    const url = this._config.apiUrl + `/marketplace/${id}`;
    return this._http.put(url, post);
   }

   public deleteMarket (id) {
    const url = this._config.apiUrl + `/marketplace/${id}`;
    return this._http.delete(url);
   }

   public getMarketplaceCategory (market) {
    const url = this._config.apiUrl + `/list-marketplace-categories?marketplace=${market}&with-products=1`;
    return this._http.get(url) .pipe(
      map((res: any) => res as any[])
   );
  }

  public postMarketplaceCategory (category) {
    const url = this._config.apiUrl + '/save-marketplace-categories';
    return this._http.post(url, category);
  }

  public getAllCategory () {
    const url = this._config.apiUrl + `/categories-tree`;
    return this._http.get(url) .pipe(
      map((res: any) => res._embedded.categories as any[])
   );
  }

  public deleteCategory(category) {
    const url = this._config.apiUrl + `/remove-marketplace-categories`;
    return this._http.post(url, category);
  }
}
