import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Marketplace } from '@b2b/models/marketplace';
import { Router } from '@angular/router';
import { MarketplaceService } from '@b2b/services/marketplace.service';

@Component({
  selector: 'b2b-list-market-item',
  templateUrl: './list-market-item.component.html',
  styleUrls: ['./list-market-item.component.scss']
})
export class ListMarketItemComponent implements OnInit {

  @Input() market: Marketplace;
  @Input() index: Marketplace;
  @Output() selectMarket: EventEmitter<any> = new EventEmitter();
  @Output() deletedMarket: EventEmitter<any> = new EventEmitter();

  constructor(private router: Router, private marketService: MarketplaceService) { }

  ngOnInit() {
  }

  public openMarcetCategories () {
    this.selectMarket.emit(this.market);
  }

  public deleteMarketEmit () {
    this.deletedMarket.emit(this.market);
  }

  public returnIndex (index) {
    if (index) {
      return index + 1;
    } else { return 1; }
  }

  public editMarket (id) {
    this.router.navigate(['/marketplace', 'edit-marketplace', id]);
  }

 public deleteMarket (id) {
   this.marketService.deleteMarket(id).subscribe(next => {
     this.deleteMarketEmit();
   });
 } 
}
