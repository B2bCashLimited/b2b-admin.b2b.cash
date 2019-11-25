import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {ConfigService} from '@b2b/services/config.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {cloneDeep} from 'lodash';
import {ACTIVITY_STATUS} from 'app/core/enums/activity-status';
import { FreeUsage } from '@b2b/models';

const ACTIVITIES_EMBEDDED_NAMES = [
  'customsBrokers',
  'customsWithoutLicenses',
  'domesticAirCarriers',
  'domesticRailCarriers',
  'domesticTruckers',
  'internationalAirCarriers',
  'internationalRailCarriers',
  'internationalTruckers',
  'manufacturers',
  'riverCarriers',
  'seaCarriers',
  'suppliers',
  'warehouses',
  'warehousesRents',
];

const APIS = {
  1: 'suppliers',
  2: 'manufacturers',
  3: 'customs-without-license',
  4: 'customs-brokers',
  5: 'international-auto-carriers',
  6: 'domestic-auto-carriers',
  7: 'international-rail-carriers',
  8: 'domestic-rail-carriers',
  9: 'international-air-carriers',
  10: 'domestic-air-carriers',
  11: 'sea-carriers',
  12: 'river-carriers',
  13: 'warehouse-rent',
  14: 'warehouses',
};
export const ACTIVITY_STATUSES = [
  {label: 'Ожидание', value: ACTIVITY_STATUS.Expectation, icon: 'fa fa-hourglass-start', status: 'expectation'},
  {label: 'Одобрен', value: ACTIVITY_STATUS.Approved, icon: 'fa fa-check', status: 'approved'},
  {label: 'Отклонен', value: ACTIVITY_STATUS.Rejected, icon: 'fa fa-times', status: 'rejected'},
  {label: 'Уточнение', value: ACTIVITY_STATUS.Refinement, icon: 'fa fa-question', status: 'refinement'},
  {label: 'Удалено', value: ACTIVITY_STATUS.Deleted, icon: 'fa fa-trash', status: 'deleted'},
];

@Injectable()
export class ActivityService {

  constructor(private _http: HttpClient,
              private _config: ConfigService) {
  }

  getActivityCompanies(filter: any, page = 1, limit = 15): Observable<any> {
    const obj: any = {
      ...filter,
      page,
      limit
    };
    const params = new HttpParams({fromObject: obj});

    return this._http.get(`${this._config.apiUrl}/activity-statuses`, {params})
      .pipe(
        map((res: any) => {
          return {
            page: res.page,
            pageCount: res.page_count,
            pageSize: res.page_size,
            totalItems: res.total_items,
            companies: normalizeCompanyActivities(res._embedded.companies, this._config.serverUrl),
          };
        })
      );
  }

  getCompanyById(id: number): Observable<any> {
    return this._http.get(`${this._config.apiUrl}/companies/${id}`);
  }

  getCompanyByActivityNameId(id: number, activityName: number): Observable<any> {
    return this._http.get(`${this._config.apiUrl}/${APIS[activityName]}/${id}`);
  }

  updateCompanyByActivityNameId(id: number, activityName: number, body: any): Observable<any> {
    return this._http.patch(`${this._config.apiUrl}/${APIS[activityName]}/${id}`, body);
  }

  updateAcivityRPC(status: number, activity: number, activityName: number, message: string = '') {
    return this._http.post(`${this._config.apiUrl}/moderate-activity`, {status, activity, activityName, message});
  }

  getActivityCounters(body: any): Observable<any> {
    return this._http.get(`${this._config.apiUrl}/count-of-activities-by-countries`, {params: body})
      .pipe(
        map((res: any[]) => {
          const countriesResult = [];
          for (const key in res[0]) {
            if (res[0].hasOwnProperty(key)) {
              const count = res[0][key];
              countriesResult.push({
                id: key.replace('country_id', ''),
                count: count
              });
            }
          }
          return countriesResult;
        })
      );
  }

  /**
   * Sets free usage period
   */
  setFreeUsage(data: FreeUsage): Observable<{result: boolean}> {
    return this._http.post(`${this._config.apiUrl}/set-activity-free-usage`, {...data})
      .pipe(map((res: {result: boolean}) => res));
  }
}

export function normalizeCompanyActivities(companies, serverUrl: string) {
  companies.forEach((company: any) => {
    company.name = company.name || company.shortName || company.shortNameRu;
    company.activities = extractActivities(company);
    company.activities.forEach(activity => {
      activity.isBonusSelected = false;
      if (Array.isArray(activity.logo)) {
        const activityLogo = activity.logo && activity.logo.pop();
        if (activityLogo) {
          activity.logo = serverUrl + activityLogo.link;
        } else {
          activity.logo = null;
        }
        activity.statusName = ACTIVITY_STATUSES.find(el => el.value === activity.status).status;
      }
      activity.hardData = getActivityByKey(activity.key);
    });
  });
  return companies;
}


function extractActivities(company: any) {
  let result = [];
  ACTIVITIES_EMBEDDED_NAMES.forEach(prop => {
    if (company[prop] && company[prop].length) {
      const activityCompanies = company[prop];
      activityCompanies.forEach(item => item.parentKey = prop);
      result = result.concat(activityCompanies);
    }
  });
  return result;
}

function getActivityByKey(key: string) {
  const nav = [
    {
      apiId: 1,
      id: 'suppliers',
      name: 'accountRightNav.link1',
      partner_name: 'partnerRightNav.link1',
      backEndName: 'Suppliers',
      data: [],
      fa: 'bb-provider',
      isActive: true,
      isGlobe: false
    },
    {
      apiId: 2,
      id: 'manufacturers',
      name: 'accountRightNav.link2',
      partner_name: 'partnerRightNav.link2',
      backEndName: 'Manufacturers',
      data: [],
      fa: 'bb-factory',
      isActive: true,
      isGlobe: false
    },
    {
      apiId: 3,
      id: 'customs-brokers',
      name: 'accountRightNav.link3',
      partner_name: 'partnerRightNav.link3',
      backEndName: 'CustomsBrokersUnlicensed',
      data: [],
      fa: 'bb-customs',
      isActive: true,
      isGlobe: false
    },
    {
      apiId: 4,
      id: 'licensed-customs-brokers',
      name: 'accountRightNav.link4',
      partner_name: 'partnerRightNav.link4',
      backEndName: 'CustomsBrokersLicensed',
      data: [],
      fa: 'bb-customs-license',
      isActive: true,
      isGlobe: false
    },
    {
      apiId: 5,
      id: 'international-auto-carriers',
      name: 'accountRightNav.link5',
      partner_name: 'partnerRightNav.link5',
      backEndName: 'InternationalTruckers',
      data: [],
      fa: 'bb-lorry-world',
      isActive: true,
      isGlobe: true
    },
    {
      apiId: 6,
      id: 'domestic-auto-carriers',
      name: 'accountRightNav.link6',
      partner_name: 'partnerRightNav.link6',
      backEndName: 'DomesticTruckers',
      data: [],
      fa: 'bb-lorry-country',
      isActive: true,
      isGlobe: false
    },
    {
      apiId: 7,
      id: 'international-rail-carriers',
      name: 'accountRightNav.link7',
      partner_name: 'partnerRightNav.link7',
      backEndName: 'InternationalRailCarriers',
      data: [],
      fa: 'bb-rails-world',
      isActive: true,
      isGlobe: true
    },
    {
      apiId: 8,
      id: 'domestic-rail-carriers',
      name: 'accountRightNav.link8',
      partner_name: 'partnerRightNav.link8',
      backEndName: 'DomesticRailCarriers',
      data: [],
      fa: 'bb-rails-country',
      isActive: true,
      isGlobe: false
    },
    {
      apiId: 9,
      id: 'international-air-carriers',
      name: 'accountRightNav.link9',
      partner_name: 'partnerRightNav.link9',
      backEndName: 'InternationalAirCarriers',
      data: [],
      fa: 'bb-plain-world',
      isActive: true,
      isGlobe: true
    },
    {
      apiId: 10,
      id: 'domestic-air-carriers',
      name: 'accountRightNav.link10',
      partner_name: 'partnerRightNav.link10',
      backEndName: 'DomesticAirCarriers',
      data: [],
      fa: 'bb-plain-country',
      isActive: true,
      isGlobe: false
    },
    {
      apiId: 11,
      id: 'sea-carriers',
      name: 'accountRightNav.link11',
      partner_name: 'partnerRightNav.link11',
      backEndName: 'SeaCarriers',
      data: [],
      fa: 'bb-ship-sea',
      isActive: true,
      isGlobe: true
    },
    {
      apiId: 12,
      id: 'river-carriers',
      name: 'accountRightNav.link12',
      partner_name: 'partnerRightNav.link12',
      backEndName: 'RiverCarriers',
      data: [],
      fa: 'bb-ship-river',
      isActive: true,
      isGlobe: false
    },
    {
      apiId: 13,
      id: 'rented-warehouse',
      name: 'accountRightNav.link13',
      partner_name: 'partnerRightNav.link13',
      backEndName: 'WarehousesRent',
      data: [],
      fa: 'bb-warehouse-rent',
      isActive: true,
      isGlobe: false
    },
    {
      apiId: 14,
      id: 'warehouses',
      name: 'accountRightNav.link14',
      partner_name: 'partnerRightNav.link14',
      backEndName: 'WarehousesStorage',
      data: [],
      fa: 'bb-warehouse-security',
      isActive: true,
      isGlobe: false
    }
  ];
  const link = getLinkByKey(key);
  const item = nav.find(el => el.name.split('.')[1] === link);
  return cloneDeep(item);
}

function getLinkByKey(key: string): string {
  const associations = {
    supplier: 'link1',
    manufacturer: 'link2',
    customsWithoutLicense: 'link3',
    customsBroker: 'link4',
    internationalTrucker: 'link5',
    domesticTrucker: 'link6',
    internationalRailCarrier: 'link7',
    domesticRailCarrier: 'link8',
    internationalAirCarrier: 'link9',
    domesticAirCarrier: 'link10',
    seaCarrier: 'link11',
    riverCarrier: 'link12',
    warehouseRent: 'link13',
    warehouse: 'link14',
  };
  return associations[key];
}
