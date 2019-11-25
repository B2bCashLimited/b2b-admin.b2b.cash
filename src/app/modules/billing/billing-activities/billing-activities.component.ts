import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {ActivityNameService} from '@b2b/services/activity-name.service';
import {map} from 'rxjs/operators';
import {ActivityNames} from '@b2b/enums';

@Component({
  selector: 'b2b-activities',
  templateUrl: './billing-activities.component.html',
  styleUrls: ['./billing-activities.component.scss']
})
export class BillingActivitiesComponent implements OnInit {
  activityNames$: Observable<any>;

  constructor(
    private _activityNameService: ActivityNameService) {
  }

  ngOnInit() {
    this.activityNames$ = this._activityNameService.getActivityNames()
      .pipe(
        map((activityNames: any) => activityNames.filter(activityName => activityName.id !== ActivityNames.Buyer))
      );
  }
}
