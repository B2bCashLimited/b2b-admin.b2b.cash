import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivityModel } from '../activity.model';

@Component({
  // tslint:disable-next-line
  selector: 'app-activities-list',
  templateUrl: './activities-list.component.html',
  styleUrls: ['./activities-list.component.scss']
})
export class ActivitiesListComponent implements OnInit {

  @Input() activities: ActivityModel[];
  @Input() selectedActivities: ActivityModel[];
  @Output() selectedActivitiesChange = new EventEmitter<ActivityModel[]>();

  constructor() { }

  ngOnInit() {
  }

  checkIfSelected(activity: ActivityModel) {
    return this.selectedActivities
      .map((act: ActivityModel) => `${act.type}${act.id}`)
      .includes(`${activity.type}${activity.id}`);
  }

  onSelect(activity: ActivityModel) {
    this.selectedActivities.push(activity);
    this.selectedActivitiesChange.emit(this.selectedActivities);
  }
}
