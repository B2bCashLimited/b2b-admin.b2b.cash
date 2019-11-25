import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { StatisticsAnalyticsService } from '@b2b/services/statistics-analytics.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ReceivedOffersStatistics } from '@b2b/models';

@Component({
  selector: 'b2b-email-list',
  templateUrl: './email-list.component.html',
  styleUrls: ['./email-list.component.scss']
})
export class EmailListComponent implements OnInit, OnDestroy {

  isLoading = false;
  isPending = false;
  receivedOffersStatistics: ReceivedOffersStatistics[] = [];

  private _unsubscribe$: Subject<void> = new Subject<void>();

  constructor(@Inject(MAT_DIALOG_DATA) private _dialogData: any,
              private _matDialogRef: MatDialogRef<EmailListComponent>,
              private _statisticsAnalyticsService: StatisticsAnalyticsService) {
  }

  ngOnDestroy(): void {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }

  ngOnInit(): void {
    this._getReceivedOffersStatistics();
  }

  onCloseClick(): void {
    this._matDialogRef.close();
  }

  /**
   * Sets selected received offers' email as viewed
   */
  setEmailAsViewed(item: ReceivedOffersStatistics): void {
    delete item.count;

    if (!this.isPending) {
      this.isLoading = true;
      this.isPending = true;

      this._statisticsAnalyticsService.setReceivedOffersStatisticEmailsAsViewed(item)
        .pipe(takeUntil(this._unsubscribe$))
        .subscribe(() => {
          this.isLoading = false;
          this.isPending = false;
          this.receivedOffersStatistics = this.receivedOffersStatistics.filter(value => value.email !== item.email);
        }, () => {
          this.isLoading = false;
          this.isPending = false;
        });
    }
  }

  /**
   * Retrieves received offers statistics
   */
  private _getReceivedOffersStatistics(): void {
    this._statisticsAnalyticsService.getReceivedOffersStatistics(this._dialogData.activityName)
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe((res: ReceivedOffersStatistics[]) => this.receivedOffersStatistics = res);
  }

}
