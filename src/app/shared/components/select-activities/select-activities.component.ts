import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ActivityNameModel } from '@b2b/models';
import { StatisticsAnalyticsService } from '@b2b/services/statistics-analytics.service';

@Component({
  selector: 'b2b-select-activities',
  templateUrl: './select-activities.component.html',
  styleUrls: ['./select-activities.component.scss']
})
export class SelectActivitiesComponent implements OnInit, OnDestroy {

  isLoading = false;
  activities: any[] = [];
  nameActivityInput$ = new Subject<string>();

  @Input() set reset(bool: boolean) {
    if (bool) {
      this.selectedActivities = [];
      this.activities = [];
    }
  }

  @Input() selectedActivities: string | string[] = [];
  @Input() disabled = false;
  @Input() selectedActivityNames: ActivityNameModel[] = [];
  @Input() multiple = false;

  @Input() set searchName(value: string) {
    if (value && value.length > 0 && this.selectedActivityNames && this.selectedActivityNames.length > 0) {
      this._getActivitiesByName(value)
        .pipe(takeUntil(this._unsubscribe$))
        .subscribe(() => this.isLoading = false, () => this.isLoading = false);
    }
  }

  @Output() selectedActivityChange = new EventEmitter();

  private _unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private _statisticsAnalyticsService: StatisticsAnalyticsService) {
  }

  ngOnInit(): void {
    this._handleNameActivity();
  }

  ngOnDestroy(): void {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }

  /**
   * Fires an event every time activity changed
   */
  onSelectedActivityChanged(evt: any): void {
    this.selectedActivityChange.emit(evt);
  }

  /**
   * Handles city for searching customs post
   */
  private _handleNameActivity(): void {
    this.nameActivityInput$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => this.activities = []),
        filter(res => !!res),
        switchMap((query: string) => this._getActivitiesByName(query))
      )
      .subscribe(() => this.isLoading = false, () => this.isLoading = false);
  }

  /**
   * Retrieves activities by searching name
   */
  private _getActivitiesByName(query: string): Observable<any> {
    const activityNameIds: number[] = [];
    this.selectedActivityNames.forEach(activity => activityNameIds.push(activity.id));
    this.isLoading = true;

    return this._statisticsAnalyticsService.getActivitiesByName(query, activityNameIds.join(','))
      .pipe(map(res => this.activities = res));
  }

}
