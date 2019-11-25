import { Component, OnInit } from '@angular/core';
import { MarketplaceService } from '@b2b/services/marketplace.service';
import { Marketplace } from '@b2b/models/marketplace';

@Component({
  selector: 'b2b-list-market-index',
  templateUrl: './list-market-index.component.html',
  styleUrls: ['./list-market-index.component.scss']
})
export class ListMarketIndexComponent implements OnInit {

  public marketList: Marketplace[];
  public seletedMarket: Marketplace;
  public isSelected: boolean;

  constructor(private marketService: MarketplaceService) { }

  ngOnInit() {
    this.marketService.getMarketplaceList().subscribe(next => {
      this.marketList = next;
    });
  }

  public openCategories (event) {
    this.seletedMarket = event;
    this.isSelected = true;
  }

  public deleteMarket (event) {
    this.marketList = this.marketList.filter(item => {
      return item.id !== event.id;
    });
  }

  public closeCategories () {
    this.isSelected = false;
  }

  public backSelect () {
    this.seletedMarket = null;
  }

}
