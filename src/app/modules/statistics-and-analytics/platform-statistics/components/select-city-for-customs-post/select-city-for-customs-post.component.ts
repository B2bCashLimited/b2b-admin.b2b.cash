import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { City } from '@b2b/models';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { StatisticsAnalyticsService } from '@b2b/services/statistics-analytics.service';

@Component({
  selector: 'b2b-select-city-for-customs-post',
  templateUrl: './select-city-for-customs-post.component.html',
  styleUrls: ['./select-city-for-customs-post.component.scss']
})
export class SelectCityForCustomsPostComponent implements OnInit, OnDestroy {

  citiesForCustomsPosts: City[] = [];
  citiesLoading = false;
  citiesInput$ = new Subject<string>();

  @Input() disabled = true;

  get selectedCityId(): number {
    return this._selectedCityId;
  }

  @Input() set selectedCityId(value: number) {
    this._selectedCityId = value;

    if (value) {
      this.citiesLoading = true;

      this._statisticsAnalyticsService.getCityById(value)
        .pipe(takeUntil(this._unsubscribe$))
        .subscribe((res: City) => {
          if (res) {
            this.citiesLoading = false;
            res.fullAddress = `${res.nameRu} (${res.region.nameRu}), ${res.region.country.nameRu}`;
            this.citiesForCustomsPosts = [res];
            this.selectedCityChange.emit(res);
          }
        }, () => this.citiesLoading = false);
    }
  }

  @Input() set reset(bool: boolean) {
    if (bool) {
      this._selectedCityId = null;
      this.citiesForCustomsPosts = [];
    }
  }

  @Output() selectedCityChange = new EventEmitter();

  private _selectedCityId: number;
  private _unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private _statisticsAnalyticsService: StatisticsAnalyticsService) {
  }

  ngOnDestroy(): void {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }

  ngOnInit(): void {
    this._handleCustomsPostCities();
  }

  /**
   * Fires an event every time city changed
   */
  onSelectedCityChanged(evt: City): void {
    this.selectedCityChange.emit(evt);
  }

  /**
   * Handles city for searching customs post
   */
  private _handleCustomsPostCities(): void {
    this.citiesInput$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => this.citiesForCustomsPosts = []),
        filter(res => !!res),
        switchMap((query: string) => this._getCitiesForCustomsPosts(query))
      )
      .subscribe();
  }

  /**
   * Retrieves cities by given name
   */
  private _getCitiesForCustomsPosts(query: string): Observable<City[]> {
    this.citiesLoading = true;

    return this._statisticsAnalyticsService.getCities(query)
      .pipe(
        map((res: City[]) => {
          this.citiesLoading = false;
          res.forEach(city => city.fullAddress = `${city.nameRu} (${city.region.nameRu}), ${city.region.country.nameRu}`);

          return this.citiesForCustomsPosts = res;
        })
      );
  }

}
