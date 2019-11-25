import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {map} from 'rxjs/operators';
import {WindowsListService} from '../windows-list.service';


@Component({
  // tslint:disable-next-line
  selector: 'app-properties-dialog',
  templateUrl: './properties-dialog.component.html',
  styleUrls: ['./properties-dialog.component.scss'],
})
export class PropertiesDialogComponent implements OnInit {

  categoryId;
  properties = [];
  page = 1;
  pageCount;
  selectedProp = {};
  selectedPropItems = [];
  dataIsFetching = true;

  constructor(
    private windowsListSvc: WindowsListService,
    public dialogRef: MatDialogRef<PropertiesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data.categoryId) {
      this.categoryId = this.data.categoryId;
      this.getCategories();
    }
    if (this.data.selected) {
      this.selectedProp = this.data.selected;
    }
    if (this.data.items) {
      this.selectedPropItems = this.data.items;
    }
  }


  ngOnInit() {
  }


  getCategories() {
    // tslint:disable-next-line
    this.windowsListSvc.getData(`category-properties?page=${this.page}&filter[0][type]=innerjoin&filter[0][field]=category&filter[0][alias]=c&filter[1][type]=eq&filter[1][field]=id&filter[1][alias]=c&filter[1][value]=${this.categoryId}&filter[1][where]=and&filter[2][type]=eq&filter[2][field]=useArea&filter[2][value]=1&filter[2][where]=and&order-by[3][type]=field&order-by[3][field]=priority&order-by[3][direction]=asc`)
      .pipe(
        map(res => {
          this.pageCount = res.page_count;
          return res._embedded.category_property;
        })
      )
      .subscribe((response) => {
        this.properties = this.properties.concat(response);
        this.dataIsFetching = false;
      });
  }

  onScroll() {
    if (this.page < this.pageCount) {
      this.page++;
      this.getCategories();
    }
  }

  getItemsProp(item, model) {
    if (model) {
      this.selectedPropItems.push(item);
    } else {
      this.selectedPropItems.forEach((prop, index) => {
        if (prop.id === item.id) {
          this.selectedPropItems.splice(index, 1);
        }
      });
    }
  }

  addProp() {
    this.dialogRef.close({
      model: this.selectedProp,
      items: this.selectedPropItems,
    });
  }

}
