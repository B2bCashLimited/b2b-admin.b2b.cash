import {Component, OnInit, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {map} from 'rxjs/operators';
import {FormControl} from '@angular/forms';
import {Subject} from 'rxjs';
import {of} from 'rxjs';
import {forkJoin} from 'rxjs';
import {ActivityModel} from '../activity.model';
import {HttpService} from '../../http.service';

@Component({
  // tslint:disable-next-line
  selector: 'app-activities-modal',
  templateUrl: './activities-modal.component.html',
  styleUrls: ['./activities-modal.component.scss']
})
export class ActivitiesModalComponent implements OnInit {

  countries = [];
  selectedCountryId = 'none';
  activities: ActivityModel[];
  selectedActivities: ActivityModel[];

  isLoading = true;
  isLoadingByInfiniteScroll = false;
  showActivitiesNotSelectedMsg = false;
  isManufacturersSearching = true;
  isSuppliersSearching = true;
  isNotFound = false;

  searchCtrl = new FormControl('');
  page = 1;

  manufacturersTotalPages = 0;
  suppliersTotalPages = 0;

  checkBoxSelectChange$ = new Subject();
  countrySelectChange$ = new Subject();

  constructor(private http: HttpService,
              public dialogRef: MatDialogRef<ActivitiesModalComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
  }

  deleteActivity(activity: ActivityModel) {
    this.selectedActivities.forEach((item, index) => {
      if (`${item.type}${item.id}` === `${activity.type}${activity.id}`) {
        this.selectedActivities.splice(index, 1);
      }
    });
  }

  onCheckBoxChanged() {
    this.checkBoxSelectChange$.next(null);
  }

  onSelectionChanged() {
    this.countrySelectChange$.next(null);
  }

  onScroll() {
    if (this.page < this.manufacturersTotalPages || this.page < this.suppliersTotalPages) {
      this.isLoadingByInfiniteScroll = true;
      this.page++;
      forkJoin(
        this.getManufacturers(),
        this.getSuppliers()
      ).pipe(
        map((res: Array<ActivityModel[]>) => {
          return res[0].concat(res[1]);
        })
      ).subscribe((res: ActivityModel[]) => {
        this.isLoadingByInfiniteScroll = false;
        this.activities.push(...res);
      });
    }
  }

  onSubmit() {
    this.dialogRef.close(this.selectedActivities);
  }

  private getManufacturers() {
    if (!this.isManufacturersSearching || this.page > this.manufacturersTotalPages) {
      return of([]);
    } else {
      return this.http.get('/manufacturers', this.getParamsObj()).pipe(
        map((response: any) => {
          const res = response._embedded.manufacturer;
          this.manufacturersTotalPages = response.page_count;

          return res.map(activity => {
            activity.type = 'manufacturer';
            return activity;
          });
        })
      );
    }
  }

  private getSuppliers() {
    if (!this.isSuppliersSearching || this.page > this.suppliersTotalPages) {
      return of([]);
    } else {
      return this.http.get('/suppliers', this.getParamsObj()).pipe(
        map((response: any) => {
          const res = response._embedded.supplier;
          this.suppliersTotalPages = response.page_count;
          return res.map(activity => {
            activity.type = 'supplier';
            return activity;
          });
        })
      );
    }
  }

  private getParamsObj() {
    const limit = this.isManufacturersSearching && this.isSuppliersSearching ? 6 : 12;
    const coutryParams = this.selectedCountryId && this.selectedCountryId !== 'none' ? {
      'filter[1][type]': 'innerjoin',
      'filter[1][alias]': 'c1',
      'filter[1][field]': 'company',
      'filter[2][type]': 'eq',
      'filter[2][alias]': 'c1',
      'filter[2][field]': 'country',
      'filter[2][value]': `${this.selectedCountryId}`
    } : {};

    return {
      'filter[0][type]': 'lowerlike',
      'filter[0][field]': 'name',
      'filter[0][value]': `${this.searchCtrl.value}%`.toLowerCase(),
      'page': `${this.page}`,
      limit,
      ...coutryParams
    };
  }

  private getCountries() {
    this.http.get('/country', {
      'order-by[0][type]': 'field',
      'order-by[0][field]': 'important',
      'order-by[0][direction]': 'desc',
      'order-by[1][type]': 'field',
      'order-by[1][field]': 'nameRu',
      'order-by[1][direction]': 'asc'
    }).subscribe((response: any) => {
      this.countries = response._embedded.country;
    });
  }
}
