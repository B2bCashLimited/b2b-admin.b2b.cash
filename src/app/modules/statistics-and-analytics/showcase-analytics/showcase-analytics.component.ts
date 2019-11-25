import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MatDialog, MatSnackBar, PageEvent} from '@angular/material';
import {map} from 'rxjs/operators';
import {ConfigService} from '@b2b/services/config.service';
import {WindowsListService} from '../../moderation/products/windows-list.service';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpService} from '../../moderation/products/http.service';

@Component({
  selector: 'b2b-showcase-analytics',
  templateUrl: './showcase-analytics.component.html',
  styleUrls: ['./showcase-analytics.component.scss']
})
export class ShowcaseAnalyticsComponent implements OnInit {
  serverUrl: string;
  companySearchValue = '';
  activitySearchValue = '';
  ststusSearchValue = '';
  approveStatus = '';
  page;
  windowsListForm: FormGroup;
  data;
  staticData;
  checkedItemsId: Array<string> = [];
  notFound = false;
  deactivate = false;
  windowsFilter = {
    nameEn: ''
  };
  allChecked = false;
  length;
  pageSize = 10;
  pageEvent: PageEvent;
  thisPages;
  showcasesType = true;
  activitiesList = [
    {
      key: 'manufacturer',
      value: 'Завод изготовитель'
    },
    {
      key: 'supplier',
      value: 'Поставщик'
    }
  ];
  stsus = [
    {
      key: '1',
      value: 'Торг Возможен'
    },
    {
      key: '2',
      value: 'Жду предложений'
    },
    {
      key: '3',
      value: 'Торг Не Возможен'
    }
  ];
  adminStatus = [
    {
      key: '1',
      value: 'Ожидает модерацию'
    },
    {
      key: '2',
      value: 'Отклонено'
    },
    {
      key: '3',
      value: 'Одобрено'
    },
    {
      key: '4',
      value: 'Уточнение'
    }
  ];
  url = 'showcases-not-admin';
  noPage = true;

  constructor(public snackBar: MatSnackBar,
              public dialog: MatDialog,
              private fb: FormBuilder,
              private httpService: HttpService,
              private route: ActivatedRoute,
              private router: Router,
              private windowsListSvc: WindowsListService,
              private _config: ConfigService) {
    this.serverUrl = this._config.serverUrl;
    this.windowsListSvc.dataListAsync.subscribe(data => {
      if (data) {
        for (let i = 0; i < data.length; i++) {
          if (data[i].isTemplate) {
            data.splice(i, 1);
          }
        }
        this.data = data;
        this.staticData = data;
        if (!this.showcasesType) {
          this.changeShowcasesType('admin');
        }
      }
    });
  }

  ngOnInit() {
    this.getFirstPage();
  }

  createForm() {
    this.windowsListForm = this.fb.group({
      setChecked: false,
      approveStatus: ''
    });
    this.windowsListForm.get('setChecked').valueChanges.subscribe(data => {
      if (data) {
        this.allChecked = true;
        this.deactivate = true;
        for (let i = 0; i < this.data.length; i++) {
          this.checkedItemsId.push(this.data[i].id);
        }
        this.openSnackBar('Пожалуйста завершите все действия потом пройдите дальше !', 'ok');
      } else {
        this.allChecked = false;
        this.deactivate = false;
        this.checkedItemsId = [];
        this.openSnackBar('Можете пройти дальше !', 'ok');
      }
    });
  }


  changeShowcasesType(e) {
    const wrapper = [];
    if (e === 'admin') {
      this.showcasesType = false;
      this.data.forEach(item => {
        if (item.user) {
          wrapper.push(item);
        }
      });
      this.data = wrapper;
    } else {
      this.showcasesType = true;
      this.data = this.staticData;
    }
  }

  changesModerator(e, id) {
    const sendData = {
      moderateStatus: Number(e)
    };
    this.windowsListSvc.editData(`showcases/${id}`, sendData).subscribe(res => {
      if (this.pageEvent) {
        this.getPage(this.pageEvent.pageIndex - 1);
      } else {
        this.getFirstPage();
      }
    });

  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  getFirstPage() {
    this.windowsListSvc.getData(`showcases?page=1`)
      .pipe(
        map(res => {
          this.pageSize = res.page_size;
          this.length = res.total_items;
          return res._embedded.showcase;
        })
      )

      .subscribe((response) => {
        this.noPage = true;
        if (response[0] === undefined) {
          this.notFound = true;
        } else {
          this.notFound = false;
          this.windowsListSvc.setusersList(response);
          this.createForm();
        }
      });
  }

  getPage(e?) {
    let url;
    if (e) {
      if (e.pageIndex || e.pageIndex === 0) {
        this.pageEvent.pageIndex = e.pageIndex + 1;
        this.page = this.pageEvent.pageIndex;
        url = this.pageEvent.pageIndex;
      } else {
        this.page = e;
        url = this.page;
      }
    } else {
      url = 1;
    }
    this.windowsListSvc.getData(`showcases?page=${url}`)
      .pipe(
        map(res => {
          this.pageSize = res.page_size;
          this.length = res.total_items;
          return res._embedded.showcase;
        }))

      .subscribe((response) => {
        this.windowsListSvc.setusersList(response);
      });

  }

  changeItemCheked(e, index) {
    if (e.target.checked) {
      this.checkedItemsId.push(index);
    } else {
      for (let i = 0; i < this.checkedItemsId.length; i++) {
        if (index === this.checkedItemsId[i]) {
          this.checkedItemsId.splice(i, 1);
        }
      }
    }
    if (this.checkedItemsId[0]) {
      this.deactivate = true;
      this.openSnackBar('Пожалуйста завершите все действия потом пройдите дальше !', 'ok');
    } else {
      this.deactivate = false;
      this.openSnackBar('Можете пройти дальше !', 'ok');
    }
  }

  deleteShowcases() {
    if (this.checkedItemsId[0]) {
      const sendData = {
        showcases: this.checkedItemsId
      };
      this.windowsListSvc.deleteData('showcases-mass-delete', sendData).subscribe(response => {
        if (this.pageEvent) {
          this.getPage(this.page);
        } else {
          this.getPage();
        }
        this.checkedItemsId = [];
      });
    } else {
      this.openSnackBar('Пожалуйста выберите элемент !', 'ok');
    }
  }

  bindPriceStatus(status) {
    let retVal = {};
    switch (status) {
      case 1:
        retVal = '#1f951a';
        break;
      case 2:
        retVal = '#f99502';
        break;
      case 3:
        retVal = '#c20710';
        break;
    }
    return retVal;
  }

  bindPriceStatusTitle(status) {
    let retVal = '';
    switch (status) {
      case 1:
        retVal = 'Торг Возможен';
        break;
      case 2:
        retVal = 'Жду предложений';
        break;
      case 3:
        retVal = 'Торг Не Возможен';
        break;
    }
    return retVal;
  }

  bindOrderStatus(status) {
    let retVal = {};
    switch (status) {
      case 1:
        retVal = '#1f951a';
        break;
      case 2:
        retVal = '#c20710';
        break;
    }
    return retVal;
  }

  bindOrderStatusTitle(status) {
    let retVal = '';
    switch (status) {
      case 1:
        retVal = 'Готов к сделке';
        break;
      case 2:
        retVal = 'Не готов к сделке';
        break;
    }
    return retVal;
  }

  /*-----------------------------SEARCH-----------------------------*/

  searchFunc(companyName, activityName, priceStatus, moderatorStatus) {
    let params = {};
    const searchArray = [];

    const companyParams = {
      'filter[0][type]': 'innerjoin',
      'filter[0][field]': 'company',
      'filter[0][alias]': 'c',
      'filter[1][type]': 'lowerlike',
      'filter[1][field]': 'name',
      'filter[1][alias]': 'c',
      'filter[1][value]': companyName + '%'
    };
    const activityParams = {
      'filter[2][type]': 'innerjoin',
      'filter[2][field]': activityName,
      'filter[2][alias]': 'a'
    };
    const priceStatusParams = {
      'filter[3][type]': 'eq',
      'filter[3][field]': 'priceStatus',
      'filter[3][value]': priceStatus
    };
    const moderatorStatusParams = {
      'filter[4][type]': 'eq',
      'filter[4][field]': 'moderateStatus',
      'filter[4][value]': moderatorStatus
    };

    if (companyName) {
      searchArray.push(companyParams);
    }
    if (activityName) {
      searchArray.push(activityParams);
    }
    if (priceStatus) {
      searchArray.push(priceStatusParams);
    }
    if (moderatorStatus) {
      searchArray.push(moderatorStatusParams);
    }
    if (searchArray.length === 1) {
      params = {
        ...searchArray[0]
      };
    } else if (searchArray.length === 2) {
      params = {
        ...searchArray[0],
        ...searchArray[1]
      };
    } else if (searchArray.length === 3) {
      params = {
        ...searchArray[0],
        ...searchArray[1],
        ...searchArray[2]
      };
    } else if (searchArray.length === 4) {
      params = {
        ...searchArray[0],
        ...searchArray[1],
        ...searchArray[2],
        ...searchArray[3]
      };
    }
    this.windowsListSvc.getDataForSearch('showcases', params)
      .pipe(
        map(res => {
          return res._embedded.showcase;
        })
      )

      .subscribe((response) => {
        this.noPage = false;
        if (!response) {
          this.notFound = true;
        } else {
          this.notFound = false;
          this.windowsListSvc.setusersList(response);
          this.createForm();
        }
      });
  }

  searchForCompany(event: any) {
    this.companySearchValue = event.target.value;
    this.searchFunc(this.companySearchValue, this.activitySearchValue, this.ststusSearchValue, this.approveStatus);
  }

  searchForActivity(value) {
    this.activitySearchValue = value;
    this.searchFunc(this.companySearchValue, this.activitySearchValue, this.ststusSearchValue, this.approveStatus);
  }

  searchForStatus(value) {
    this.ststusSearchValue = value;
    this.searchFunc(this.companySearchValue, this.activitySearchValue, this.ststusSearchValue, this.approveStatus);
  }

  searchApproved(value) {
    this.approveStatus = value;
    this.searchFunc(this.companySearchValue, this.activitySearchValue, this.ststusSearchValue, this.approveStatus);
  }

  getShowcaseId() {
    this._config.loadingSpinner = true;
    const body = {
      priceStatus: null,
      orderStatus: null,
      logo: [],
      nameEn: '',
      moderateStatus: null,
      category: null,
      company: null,
      manufacturer: null,
      supplier: null,
      isTemplate: true,
      properties: [],
      products: [],
      businessProperties: [],
      overrideProperties: []
    };

    this.httpService.post(`/showcases`, body).subscribe((res: any) => {
      const showcase = res && res.body;
      this.router.navigate([`../showcases/${showcase.id}/edit`], {relativeTo: this.route});
    }, () => {
    }, () => {
      this._config.loadingSpinner = false;
    });
  }
}
