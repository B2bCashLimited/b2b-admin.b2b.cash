import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {ActivityModel} from '../activity.model';
import {ConfigService} from '@b2b/services/config.service';

@Component({
  // tslint:disable-next-line
  selector: 'app-activity-item',
  templateUrl: './activity-item.component.html',
  styleUrls: ['./activity-item.component.scss']
})
export class ActivityItemComponent implements OnInit {

  @Input() activity: ActivityModel;
  @Input() isSelected: boolean;
  @Output() select = new EventEmitter<ActivityModel>();

  imgUrl: string;

  constructor(private _config: ConfigService) {
  }

  ngOnInit() {
    if (this.activity.logo[0]) {
      this.imgUrl = this._config.serverUrl + this.activity.logo[0].link;
    } else {
      this.imgUrl = '/assets/images/photo_not_found.jpg';
    }
  }

  onSelect() {
    this.select.emit(this.activity);
  }
}
