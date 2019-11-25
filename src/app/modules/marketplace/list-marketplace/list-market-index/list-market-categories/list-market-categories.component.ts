import { Component, OnInit, Input } from '@angular/core';
import { Marketplace } from '@b2b/models/marketplace';
import { MarketplaceService } from '@b2b/services/marketplace.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MarketCategory } from '@b2b/models/market-category';
import { MatDialog } from '@angular/material';
import {
  AddCategoryMarketDialogComponent
} from '@b2b/shared/components/add-category-market/add-category-market-dialog/add-category-market-dialog.component';
import { CategoryIconEditDialogComponent } from '../popups/category-icon-edit-dialog/category-icon-edit-dialog.component';
import { MoreCatetegoryDialogComponent } from '@b2b/shared/components/more-catetegory-dialog/more-catetegory-dialog.component';

@Component({
  selector: 'b2b-list-market-categories',
  templateUrl: './list-market-categories.component.html',
  styleUrls: ['./list-market-categories.component.scss']
})
export class ListMarketCategoriesComponent implements OnInit {

  @Input() market: Marketplace;

  public category: any;
  public isEmpty: boolean;
  public isLoading: boolean;
  public isAccept: boolean;
  public allCategory: MarketCategory[];

  constructor(
    private marketSerice: MarketplaceService,
    private _matDialog: MatDialog,
  ) {
  }

  ngOnInit() {
    this.getCategoryes();
  }

  public getCategoryes () {
    this.isLoading = true;
    this.marketSerice.getMarketplaceCategory(this.market.name).subscribe(next => {
      this.category = next;
      this.isLoading = false;
      this.isEmpty =  this.category.length === 0 ? true : false;
    });
  }

  public deletCategory (cat) {
    const pushArr = [];
    pushArr.push(Number(cat.categoryId));
    const postDelete = {
      marketplace: this.market.name,
      categories: pushArr
    };
    this.marketSerice.deleteCategory(postDelete).subscribe(next => {
    });
    this.category = this.category.filter(item => item.id !== cat.id);
  }

  public drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.category, event.previousIndex, event.currentIndex);
    this.category.forEach((element, index) => {
      element.priority = index + 1;
    });
  }

  
  public openMoreChildren (child) {
    this._matDialog.open(MoreCatetegoryDialogComponent, {
      width: '600px',
      maxHeight: '90vh',
      data: {
        children: child
      },
      disableClose: true,
    }).afterClosed().subscribe(result => {
    });
  }

  public openAddCategory () {
    this._matDialog.open(AddCategoryMarketDialogComponent, {
      width: '600px',
      maxHeight: '90vh',
      data: {
        marketplace: this.market,
        categories: this.category
      },
      disableClose: true,
    }).afterClosed().subscribe(result => {
      this.getCategoryes();
    });
  }

  public dropChild (event, child) {
    moveItemInArray(child, event.previousIndex, event.currentIndex);
    child.forEach((element, index) => {
      element.priority = index + 1;
    });
  }

  public save () {
    const categoryArr = [];
    this.category.forEach((a) => {
      a.childs.forEach((b) => {
        const childCat = {
          id: b.id,
          categoryId: b.categoryId,
          priority: b.priority,
          parent: a.categoryId 
        };
        categoryArr.push(childCat);
      });
      const cat = {
        id: a.id,
        categoryId: a.categoryId,
        priority: a.priority,
        parent: null 
      };
      categoryArr.push(cat);
    });
    const postData = {
      marketplace: this.market.name,
      categories: categoryArr
    };
    this.marketSerice.postMarketplaceCategory(postData).subscribe(next => {
      this.isAccept = true;
      setTimeout(() => {
        this.isAccept = false;
   }, 3000);
    });
  }

  onEditCategoryIconClick(category: any): void {
    this._matDialog.open(CategoryIconEditDialogComponent, {
      data: category,
      autoFocus: false
    });
  }

}
