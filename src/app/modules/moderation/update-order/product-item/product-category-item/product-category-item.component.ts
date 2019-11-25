import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { PageEvent } from '@angular/material';
import { Subscription } from 'rxjs';
import { uniqBy } from 'lodash';
import { OrderService } from '@b2b/services/order.service';
import { ConfigService } from '@b2b/services/config.service';

@Component({
  selector: 'b2b-product-category-item',
  templateUrl: './product-category-item.component.html',
  styleUrls: ['./product-category-item.component.scss']
})
export class ProductCategoryItemComponent implements OnInit, OnDestroy {
  @Input() orderId: number;
  @Input() categoryId: number;
  @Input() selectedIndex = 0;
  @Input() combined = false; // если это категория в сборном заказе

  products = [];
  pager: PageEvent = {
    length: 0,
    pageIndex: 0,
    pageSize: 0
  };
  totalPages = 0;

  activityNames: string[] = [];
  activityNamesIds: number[] = [];
  categoryProperties = [];
  alternativeModel: any = {};
  dataModel: any = {};
  productModel: any = {};

  isDisable = false;
  currency: any;
  countMe: any;
  waitingForOffers = false;
  showVolume = false;

  filteredActivities: any;
  companyShowcasesByCategory;

  private _item: any;
  private _productsSub: Subscription;
  loading: boolean;

  constructor(
    public config: ConfigService,
    private _orderService: OrderService) {
  }

  @Input() set item(value) {
    if (this._item !== value) {
      this._item = value;
      if (value) {
        this.normalizeOrderInformation(value);
      }
    }
  }

  get item() {
    return this._item;
  }

  ngOnInit() {
    this.getProducts();
  }

  ngOnDestroy() { }

  public retPrice(a) {
    return (+a).toFixed(2);
  }

  getPropValue(prodProps, id) {
    const result = {
      value: null,
      unit: null
    };
    const prop = prodProps.find((item) => item.categoryProperty.id === +id);

    if (prop) {
      if (prop[`value${this.config.locale}`]) {
        if (prop[`value${this.config.locale}`].hasOwnProperty('display')) {
          result.value = prop[`value${this.config.locale}`].display;
        } else {
          result.value = prop[`value${this.config.locale}`];
        }
      } else {
        result.value = prop.value;
      }

      if (result.value) {
        result.unit = prop.categoryProperty.unit && prop.categoryProperty.unit[`name${this.config.locale}`];
      }
    }
    return result;
  }

  private normalizeOrderInformation(value) {
    this.showVolume = (+value.totalVolume) > 0;
    this.currency = value.currency;
    this.countMe = value.countMe;
    this.waitingForOffers = +(value.paymentOption && value.paymentOption.id) === 3;
    if (value.supplierOrManufacturer === 1) {
      this.activityNames = ['suppliers'];
      this.activityNamesIds = [1];
    } else if (value.supplierOrManufacturer === 2) {
      this.activityNames = ['manufacturers'];
      this.activityNamesIds = [2];
    } else {
      this.activityNames = ['suppliers', 'manufacturers'];
      this.activityNamesIds = [1, 2];
    }
  }

  onScrollDown() {
    if (this.pager.pageIndex < this.totalPages) {
      this.getProducts();
    }
  }

  getProducts() {
    const query = {
      freeOrder: this.orderId,
      page: ++this.pager.pageIndex,
      limit: 10
    };
    this.loading = true;
    this._productsSub = this._orderService.retrieveFreeProduct(query)
      .subscribe(({ pager, data }) => {
        this.loading = false;
        this.totalPages = pager.totalPages;
        this.pager = {
          pageSize: pager.perPage,
          length: pager.totalItems,
          pageIndex: pager.currentPage
        };

        this.dataModel = {};
        data.forEach(prod => {
          prod.product = prod.product || prod;
          prod.product.showcaseUnits = prod.product.showcaseUnits || prod.showcase.showcaseUnits;
          prod.product.country = prod.countryData || prod.product.country;
          this.currency = this.currency || prod.showcase.showcaseUnits.currency;
          prod.freeProductProperties = prod.freeProductProperties || prod.productProperties || [];
          prod.freeProductProperties.forEach((pr) => {
            this.categoryProperties.push(pr.categoryProperty);
            this.categoryProperties = uniqBy(this.categoryProperties, 'id');
          });
          const prop = prod.freeProductProperties.find((pr) => pr.categoryProperty.special === 4);

          this.dataModel[prod.id] = {
            oneUnit: !!prop,
            value: 1
          };
          if (prop) {
            if (prop.value && typeof prop.value === 'object') {
              this.dataModel[prod.id].value = +prop.value.display;
            } else if (prop[`value${this.config.locale}`] && prop[`value${this.config.locale}`].display) {
              this.dataModel[prod.id].value = +prop[`value${this.config.locale}`].display;
            } else {
              this.dataModel[prod.id].value = +prop.value || +prop[`value${this.config.locale}`];
            }
          }

          if (this.dataModel[prod.id].oneUnit) {
            prod.totalPrice = this.retPrice(this.dataModel[prod.id].value * (+prod.count) * (+prod.price));
          } else {
            prod.totalPrice = this.retPrice((+prod.count) * (+prod.price));
          }
        });

        this.alternativeModel = {};
        data.forEach((prod) => {
          this.alternativeModel[prod.id] = false;
        });

        this.products = data;
      }, () => {
        this.loading = false;
      });
  }

  onSubmit(scope) {
    const payload = {
      scope,
      data: null
    };
  }
}
