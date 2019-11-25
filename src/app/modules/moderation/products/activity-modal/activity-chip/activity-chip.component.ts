import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {ActivityModel} from '../activity.model';

@Component({
  // tslint:disable-next-line
  selector: 'app-activity-chip',
  templateUrl: './activity-chip.component.html',
  styleUrls: ['./activity-chip.component.scss']
})
export class ActivityChipComponent implements OnInit {

  @Input() activity: ActivityModel;
  @Output() delete = new EventEmitter();

  constructor() {
  }

  ngOnInit() {
  }

  onDelete() {
    this.delete.emit();
  }
}
