import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Observable} from 'rxjs';
import {ActivityNameService} from '@b2b/services/activity-name.service';
import {tap} from 'rxjs/operators';
import {ActivityNameModel} from '@b2b/models';

@Component({
  selector: 'b2b-select-activity-names',
  templateUrl: './select-activity-names.component.html',
  styleUrls: ['./select-activity-names.component.scss']
})
export class SelectActivityNamesComponent implements OnInit {
  @Input() multiple = false;
  @Input() selectedActivityName: number | number[];
  @Input() maxSelectedItems: number;
  @Input() disabled = false;
  @Output() selectedActivityNameChange = new EventEmitter();

  activityNames$: Observable<any>;
  loading = false;

  constructor(
    private _activityNameService: ActivityNameService) {
  }

  ngOnInit(): void {
    this.loading = true;
    this.activityNames$ = this._activityNameService.getActivityNames()
      .pipe(
        tap(() => this.loading = false)
      );
  }
  
  /**
   * Fires an event every time activity name changed
   */
  onSelectedActivityNameChanged(evt: ActivityNameModel | ActivityNameModel[]): void {
    this.selectedActivityNameChange.emit(evt);
  }
}
