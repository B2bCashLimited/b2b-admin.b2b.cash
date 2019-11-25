import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivityModel } from './activity-modal/activity.model';
import { Subscription } from 'rxjs';
import { MatDialog, MatSnackBar, PageEvent } from '@angular/material';
import { UserService } from '@b2b/services/user.service';
import { ConfigService } from '@b2b/services/config.service';
import { map, mergeMap } from 'rxjs/operators';
import { ActivitiesModalComponent } from './activity-modal/activities-modal/activities-modal.component';
import { clearSubscription } from '@b2b/decorators';
import { PropertiesDialogComponent } from './properties-dialog/properties-dialog.component';
import { Activity, ProductFullSearch } from './models/product-full-search.model';
import { Photo } from './models/photo.model';
import { WindowsListService } from './windows-list.service';
import { SocketService } from '@b2b/services/socket.service';
import { CategoryService } from '@b2b/services/category.service';
import { UnmoderatedCategoriesListComponent } from './unmoderated-categories-list/unmoderated-categories-list.component';
import { TreeComponent } from '@b2b/shared/modules';

@Component({
  selector: 'b2b-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit, OnDestroy {
  @ViewChild('categoryList') categoryList: UnmoderatedCategoriesListComponent;
  data: ProductFullSearch[];

  imagesToShow: Photo[];
  isShowingImages = false;

  // paginator fields
  length = 5;
  pageIndex = 0;
  pageSize = 5;

  category: any;
  categoryData: CategorySocketModel[] = [];
  countersData = { categoriesCount: 0, productsCount: 0 };
  countries: any[];
  filter = {};
  firstSocketInit = false;
  isShowSidebarScroll = false;
  priceFor: any[];
  priceUnits: any[];
  propertiesFilter = {};
  selectedActivities: ActivityModel[] = [];
  selectedProp = {};
  selectedPropItems = [];
  startedSearching = false;

  moderateFilter = {
    status1: true,
    status3: false,
    status4: false
  };
  activityTypeFilter = {
    manufactories: true,
    suppliers: true
  };

  private _categoryStorageKey = 'filterCategory';
  private _notModeratedProductsObj = {};

  /**
   * Subscriptions
   */
  private _countriesSub: Subscription;
  private _editProductSub: Subscription;
  private _moderateModeChangedSub: Subscription;
  private _priceForSub: Subscription;
  private _priceUnitsSub: Subscription;
  private _productFullSearchSub: Subscription;
  private _socketSub: Subscription;

  constructor(private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private windowsListSvc: WindowsListService,
    private _socketService: SocketService,
    private userService: UserService,
    private _config: ConfigService,
    private _categoryService: CategoryService) {
  }

  ngOnInit() {
    this.getCategory();
    this.getUnits();
    this.subscribeModerator();
  }

  ngOnDestroy() {
    this.unsubscribeModerator();
    this._config.loadingSpinner = false;
  }

  /**
   * Get Units for Main Filter
   */
  private getUnits(): void {
    this._priceUnitsSub = this.windowsListSvc
      .getData(`unit?filter[0][type]=eq&filter[0][field]=controlUnitType&filter[0][value]=2`)
      .pipe(
        map(response => response._embedded.unit)
      )
      .subscribe(res => this.priceUnits = res);

    this._priceForSub = this.windowsListSvc
      .getData(`unit?filter[0][type]=eq&filter[0][field]=controlUnitType&filter[0][value]=1`)
      .pipe(
        map(response => response._embedded.unit)
      )
      .subscribe(res => this.priceFor = res);

    this._countriesSub = this.windowsListSvc
      .getData(`country?order-by[0][type]=field&order-by[0][field]=important&order-by[0][direction]=desc
      &order-by[1][type]=field&order-by[1][field]=nameRu&order-by[1][direction]=asc`)
      .pipe(
        map(response => response._embedded.country)
      )
      .subscribe(countries => this.countries = countries);
  }

  openCategory() {
    this.dialog.open(TreeComponent, {
      width: '800px',
      data: {
        multiple: false,
        category: this.category
      }
    }).afterClosed().subscribe(selectedCategory => {
      this.onCategoryChanged(selectedCategory);
    });
  }

  openActivitiesModal() {
    const dialogRef = this.dialog.open(ActivitiesModalComponent, {
      width: '1000px',
      data: {
        selectedActivities: [...this.selectedActivities]
      }
    });

    dialogRef.afterClosed().subscribe((selectedActivities: ActivityModel[]) => {
      if (selectedActivities) {
        this.selectedActivities = selectedActivities;
      }
    });
  }

  onCategoryChanged(category) {
    if (category) {
      this.category = category;
      this.clearExtraProps();
      this.search(this.pageIndex + 1);
      localStorage.setItem(this._categoryStorageKey, JSON.stringify(category));
    }
  }

  onModerateModeChanged(mode: number, activity: any) {
    let endpoint: any = {};
    let showcase: any;
    if (activity.showcase.supplier) {
      showcase = activity.showcase.supplier;
      endpoint = {
        endpoint: 'suppliers',
        entity: 'supplier'
      };
    } else {
      showcase = activity.showcase.manufacturer;
      endpoint = {
        endpoint: 'manufacturers',
        entity: 'manufacturer'
      };
    }
    const body = {
      name: showcase.name,
      fullName: showcase.fullName,
      trusted: mode,
      countEmployees: showcase.countOfEmployees,
    };

    clearSubscription(this._moderateModeChangedSub);
    this._moderateModeChangedSub = this.windowsListSvc.editData(`${endpoint.endpoint}/${showcase.id}`, body)
      .subscribe(() => {
        this._config.loadingSpinner = true;
        this.showSnackBar(`Режим модерации для вида деятельности ${showcase.fullName} изменен`);
        this.search(this.pageIndex + 1, false);
        const updateModerateParams = { [endpoint.entity]: showcase.id };
        this.windowsListSvc.updateModerateStatus(updateModerateParams).subscribe(res => {
          this.search(this.pageIndex + 1);
        }, () => {
          this._config.loadingSpinner = false;
        });
      }, () => {
        this._config.loadingSpinner = false;
      });
  }

  addProperties() {
    const dialogRef = this.dialog.open(PropertiesDialogComponent, {
      width: '800px',
      data: {
        categoryId: this.category.id,
        selected: Object.assign({}, this.selectedProp),
        items: Object.assign([], this.selectedPropItems)
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selectedProp = result.model;
        this.selectedPropItems = result.items;
      }
    });
  }

  deleteProp(item) {
    delete this.propertiesFilter[item.id];

    this.selectedProp[item.id] = false;
    this.selectedPropItems = this.selectedPropItems.filter(prop => prop.id !== item.id);
  }

  deleteActivity(activity: ActivityModel) {
    this.selectedActivities = this.selectedActivities.filter(item => `${item.type}${item.id}` !== `${activity.type}${activity.id}`);
  }

  openPhotoViewer(photos: Photo[]) {
    this.imagesToShow = photos;
    this.isShowingImages = true;
  }

  getPage(e: PageEvent) {
    this.search(e.pageIndex + 1);
  }

  search(page = 1, showLoader = true) {
    // if category not selected or search already started
    // TODO: Убрать комментарий после внедрения новой модалки выбора категорий
    /*if (!this.category || !this.category.id || this.startedSearching) {
      return;
    }*/

    // show loader page only on click Search Button or Changing Page
    if (showLoader) {
      this._config.loadingSpinner = true;
    }

    // ставим правильную страницу для mat-paginator
    this.pageIndex = page - 1;

    // to not search by socket repeatly
    this.startedSearching = true;

    clearSubscription(this._productFullSearchSub);
    this._productFullSearchSub = this.windowsListSvc
      .getData(`product-full-search?page=${page}${this.getModerateStatusesParamsString()}`, this.getParamsObject())
      .pipe(
        map(response => {
          this.pageSize = +response.page_size;
          this.length = +response.total_items;
          const res = response._embedded.products;

          return res.map((val: ProductFullSearch) => {
            val.activity = { isModerateModeChanging: false } as Activity;

            if (val.supplierName && val.supplierId) {
              val.activity.id = val.supplierId;
              val.activity.name = val.supplierName;
              val.activity.fullName = val.supplierFullName;
              val.activity.moderateStatus = val.supplierModerateStatus;
              val.activity.countEmployees = val.supplierCountEmployees;
              val.activity.type = 'supplier';
            } else if (val.manufactureId && val.manufactureName) {
              val.activity.id = val.manufactureId;
              val.activity.name = val.manufactureName;
              val.activity.fullName = val.manufactureFullName;
              val.activity.moderateStatus = val.manufactureModerateStatus;
              val.activity.countEmployees = val.manufactureCountEmployees;
              val.activity.type = 'manufactory';
            }

            if (val.productProperties) {
              val.productProperties.sort(compareByParam('categoryPropertyId'));
            }

            return val;
          });
        })
      )
      .subscribe((res: ProductFullSearch[]) => {
        this.data = res;

        this.startedSearching = false;
        this._config.loadingSpinner = false;
      }, () => {
        this._config.loadingSpinner = false;
      });
  }

  changeModeratorStatus(status: number, product: ProductFullSearch) {
    const oldStatus = product.moderateStatus;
    const categoryId = product.showcase.category;

    if (oldStatus === 3 || status !== oldStatus) {
      const sendData = {
        photos: product.photos,
        moderateStatus: status,
        moderateComment: status !== 3 ? '' : product.moderateComment
      };

      clearSubscription(this._editProductSub);
      this._editProductSub = this.windowsListSvc.editData(`products/${product.id}`, sendData).pipe(map(value => {
        product.moderateStatus = status;
        product.moderateCommentEditing = false;
        if (status !== 3) {
          product.moderateComment = '';
        }
        this.showSnackBar('Статус модерации изменен');
        this.sendProductStatusUpdatedEvent(product, status);
        this.deleteFromCategory(categoryId, product.id);
        this.search(this.pageIndex + 1, false);
        return value;
      }), mergeMap(value => { // чистим кэш категорий (добавить проверку на наличие промодерированых товаров в витрине когда будет бэк)
        // value.showcase.---
        return this._categoryService.clearCache();
      }))
        .subscribe();
    }
  }

  clearFilter() {
    Object.keys(this.filter).forEach(propName => this.filter[propName] = '');

    this.clearExtraProps();

    // clear selected category, but search will not work
    this.category = {};
    localStorage.setItem(this._categoryStorageKey, JSON.stringify(this.category));
  }

  /**
   * Select category from sidebar categories top
   */
  selectCategory(category) {
    delete category._links;

    this.moderateFilter.status1 = true;
    this.onCategoryChanged(category);
  }

  /**
   * Add scroll class to Categories Sidebar
   */
  showSidebarScroll() {
    this.isShowSidebarScroll = true;
  }

  private clearExtraProps() {
    this.selectedProp = {};
    this.selectedPropItems = [];
    this.propertiesFilter = {};
  }

  private getParamsObject() {
    const paramsObj = {
      // TODO: Убрать комментарий после внедрения новой модалки выбора категорий
      'category': `${this.category.id}`,
      'limit': `${this.pageSize}`,
    };

    Object.keys(this.filter).forEach(propName => {
      if (this.filter[propName] && this.filter[propName] !== '') {
        paramsObj[propName] = this.filter[propName];
      }
    });

    const propertiesArray = Object.keys(this.propertiesFilter).reduce((prev, propName) => {
      const value = this.propertiesFilter[propName];
      if (value && value !== '') {
        prev.push({ property: propName, value: value });
      }
      return prev;
    }, []);
    if (propertiesArray.length > 0) {
      paramsObj['properties'] = JSON.stringify(propertiesArray);
    }

    const activities = this.selectedActivities.map((act: ActivityModel) => ({ type: act.type, id: act.id }));
    if (activities.length > 0) {
      paramsObj['activities'] = JSON.stringify(activities);
    }

    const activityTypes = [];
    if (this.activityTypeFilter.manufactories) {
      activityTypes.push({ type: 'manufacturer' });
    }
    if (this.activityTypeFilter.suppliers) {
      activityTypes.push({ type: 'supplier' });
    }
    if (activityTypes.length > 0) {
      paramsObj['activityTypes'] = JSON.stringify(activityTypes);
    }

    return paramsObj;
  }

  /**
   * нужно задавать параметр для статуса модерации строкой, потому что идентификаторы объектов должны быть уникальны
   */
  private getModerateStatusesParamsString(): string {
    let moderateStatusesParams = '';
    if (this.moderateFilter.status1) {
      moderateStatusesParams += '&statuses[]=1&statuses[]=2';
    }
    if (this.moderateFilter.status3) {
      moderateStatusesParams += '&statuses[]=3';
    }
    if (this.moderateFilter.status4) {
      moderateStatusesParams += '&statuses[]=4';
    }

    return moderateStatusesParams;
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'OK', { duration: 3000 });
  }

  /**
   * Get Category from storage or open new Category Modal to select
   */
  private getCategory(): void {
    try {
      this.category = JSON.parse(localStorage.getItem(this._categoryStorageKey));
    } catch {
    }
  }

  /**
   * Connect current moderator(user) and subscribe to moderate products
   */
  private subscribeModerator(): void {
    this._socketService.emit('moderator_product_subscribe', {});

    /**
     * Listener to get new not moderated products
     */
    this._socketService.on('not_moderated_products', (data: any) => {
      this.getNotModerateProducts(data);
    });

  }

  /**
   * Unsubscribe current moderator(user) and disconnect onDestroy
   */
  private unsubscribeModerator(): void {
    this._socketService.emit('moderator_product_unsubscribe', {});
  }

  /**
   */
  private sendProductStatusUpdatedEvent(product: ProductFullSearch, status: number): void {
    this._socketService.emit('product_status_update', {
      product_id: product.id,
      status: status,
    });
  }

  private getNotModerateProducts(item): void {
    const newProducts = [];
    const products = item.data || [];
    let getCurCategoryProduct = false;

    // check new products
    products.forEach((product: ProductSocketModel) => {
      if (!this._notModeratedProductsObj.hasOwnProperty(product.id)) {
        this._notModeratedProductsObj[product.id] = product.date_moderate;

        newProducts.push(product);

        // change only one time
        if (this.category && !getCurCategoryProduct) {
          getCurCategoryProduct = +product.categoryId === +this.category.id;
        }
      }
    });

    // if got new products
    if (newProducts.length) {
      // add new values to categories and sort by time
      this.getCategoriesByTime(newProducts);

      // if showing products count less then pageSize, then request
      if (getCurCategoryProduct) {
        if (!this.data || this.data.length < this.pageSize) {
          this.search(this.pageIndex + 1, false);
        } else {
          if (this.firstSocketInit) {
            this.length++;
          }
        }
      }

      // don't show this message for first time
      if (this.firstSocketInit) {
        this.showSnackBar('Получен новый товар ожидающий модерации');
      }
    } else {
      this.checkCurrentCategory();
    }

    this.firstSocketInit = true;
  }

  /**
   * Get and sort TOP CATEGORIES for right sidebar
   */
  private getCategoriesByTime(products: ProductSocketModel[]): void {
    const categoriesObj = {};

    this.categoryData.forEach((category: CategorySocketModel) => categoriesObj[category.id] = category);

    // sort new products
    products.forEach((product: ProductSocketModel) => {
      if (categoriesObj.hasOwnProperty(product.categoryId)) {
        const category = categoriesObj[product.categoryId];

        category.productCount++;
        category.productsId.push(product.id);
        if (category.moderateMinTime > product.date_moderate) {
          category.moderateMinTime = product.date_moderate;
        }
      } else {
        categoriesObj[product.categoryId] = {
          id: +product.categoryId,
          name: product.categoryNameRu,
          moderateMinTime: product.date_moderate,
          productCount: 1,
          productsId: [product.id]
        };
      }
    });

    const categories = Object.keys(categoriesObj).reduce((prev, key) => {
      prev.push(categoriesObj[key]);
      return prev;
    }, []);

    this.categoryData = categories.sort(compareByParam('moderateMinTime'));
    this.countersData.categoriesCount = this.categoryData.length;
    this.countersData.productsCount += products.length;

    this.checkCurrentCategory();
  }

  /**
   * Delete product from TOP CATEGORIES and sort categories
   */
  private deleteFromCategory(categoryId: number, productId: string): void {
    let sortCategory = false;
    let changeCategory = false;

    this.categoryData = this.categoryData.filter((category: CategorySocketModel) => {
      if (+category.id === categoryId) {
        this.data = this.data.filter((product: any) => +product.id !== +productId);
        category.productsId = category.productsId.filter((id: number) => id !== +productId);
        category.productCount = category.productsId.length;

        // if deleted product oldest in category, change CATEGORY moderateMinTime
        if (category.productCount && this._notModeratedProductsObj.hasOwnProperty(productId)
          && category.moderateMinTime === this._notModeratedProductsObj[productId]) {
          // changed moderateMinTime, need to sort
          sortCategory = true;

          category.moderateMinTime = this._notModeratedProductsObj[category.productsId[0]];
          category.productsId.forEach((id: number) => {
            if (category.moderateMinTime > this._notModeratedProductsObj[id]) {
              category.moderateMinTime = this._notModeratedProductsObj[id];
            }
          });
        }

        // clear
        delete this._notModeratedProductsObj[productId];

        changeCategory = !category.productCount;
      }

      return category.productCount > 0;
    });

    // decrement product counter
    this.countersData.productsCount--;

    // if category changed moderateMinTime and need to sort
    if (sortCategory) {
      this.categoryData.sort(compareByParam('moderateMinTime'));
      this.countersData.categoriesCount = this.categoryData.length;
    }

    // if current category deleted, change to next
    if (changeCategory) {
      this.checkCurrentCategory();
    }
  }

  /**
   * if category not selected,
   * or category selected, but products array is empty
   * select the oldest from TOP CATEGORIES only MODERATE STATUS WAITED is checked
   */
  private checkCurrentCategory(): void {
    if (this.moderateFilter.status1 &&
      (!this.category || !this.category.id ||
        (this.category.id && this.categoryData.length > 0 && this.categoryData[0].id !== this.category.id
          && !this.startedSearching && (!this.data || !this.data.length)))
    ) {
      this.onCategoryChanged(this.categoryData[0]);
    }
  }
}

function compareByParam(propName: string) {
  let sortOrder = 1;
  if (propName[0] === '-') {
    sortOrder = -1;
    propName = propName.substr(1);
  }

  return function (a, b) {
    return ((a[propName] < b[propName]) ? -1 : (a[propName] > b[propName]) ? 1 : 0) * sortOrder;
  };
}


export interface ProductSocketModel {
  id: number;
  categoryId: number;
  categoryNameCn: string;
  categoryNameEn: string;
  categoryNameRu: string;
  date_moderate: string;
}

export interface CategorySocketModel {
  id: number;
  name: string;
  moderateMinTime: string;
  productCount: number;
  productsId: number[];
}
