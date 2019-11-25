import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot,
         ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';         
import { MarketplaceService } from './marketplace.service';
import { map } from 'rxjs/operators';

@Injectable()
export class EditMarketplaceResolver implements Resolve<any> {
  constructor(private marketplaceService: MarketplaceService, private router: Router) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const id = route.paramMap.get('marketId');
    return this.marketplaceService.getSomeMarketplace(id).pipe(
        map((res: any) => res as any)
      );
  }
}
