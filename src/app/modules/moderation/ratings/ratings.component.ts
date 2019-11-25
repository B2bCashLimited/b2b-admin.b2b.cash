import {Component, OnInit} from '@angular/core';
import {ActivityNameService} from '@b2b/services/activity-name.service';
import {Observable} from 'rxjs';
import {ActivityNameModel} from '../../../core/models/activity-name-model';
import {filter, map, mergeMap, switchMap} from 'rxjs/operators';
import {MatDialog, MatSnackBar} from '@angular/material';
import {DeleteTemplateDialogComponent} from './dialogs/delete-template-dialog/delete-template-dialog.component';
import {ConfigureRatingDialogComponent} from './dialogs/configure-rating-dialog/configure-rating-dialog.component';
import {ChooseCountryComponent} from './dialogs/choose-country-dialog/choose-country.component';
import {Country} from './dialogs/utils/countries';
import {Router} from '@angular/router';
import {RatingsTemplateComponent} from './ratings-template/ratings-template.component';
import { RatingService } from '@b2b/services/rating.service';

@Component({
  selector: 'b2b-ratings',
  templateUrl: './ratings.component.html',
  styleUrls: ['./ratings.component.scss']
})
export class RatingsComponent implements OnInit {
  activityNames$: Observable<ActivityNameModel[]>;
  templates: any;

  constructor(
    private _activityNameService: ActivityNameService,
    private _ratingService: RatingService,
    private router: Router,
    private _matDialog: MatDialog,
    private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.activityNames$ = this._activityNameService.getActivityNames();
  }

  onActivityNameClick(activityName: ActivityNameModel) {
    this.templates = [];
    this._getRatingTemplates(activityName).subscribe();
  }

  editDealsRate(activityName, template: any) {
    this._matDialog.open(ConfigureRatingDialogComponent, {
      width: '768px',
      height: '380px',
      disableClose: true,
      data: {
        activityName,
        template,
      }
    }).afterClosed()
      .pipe(
        filter(res => res && !!res),
        switchMap(() => this._getRatingTemplates(activityName))
      ).subscribe();
  }

  editTemplate(activityName, template: any) {
    if (template['_embedded'].country.id) {
      this._matDialog.open(RatingsTemplateComponent, {
        width: '1024px',
        height: '700px',
        data: {
          id: +template['_embedded'].country.id,
          ratingTemplateId: +template.id,
        }
      });
    }
  }

  addCountry(activityName: any) {
    this._matDialog.open(ChooseCountryComponent).afterClosed()
      .subscribe( (country: Country) => {
        if (!country) {
          return;
        }

        this.createCountry(country, activityName);
      });
  }

  createCountry(country: Country, activityName: any) {
    this._ratingService.postRatingTemplate(
      activityName.id, country.id, [], []
    ).pipe(
      mergeMap(() => this._ratingService.getRatingTemplates(activityName.id)),
      mergeMap(() => this._getRatingTemplates(activityName))
    ).subscribe(() => {
      this.snackBar.open(`Шаблон ${country.nameRu}`, 'Продолжить', { duration: 3000});
    });
  }

  onDestroyTemplateClick(activityName: ActivityNameModel, template: any) {
    this._matDialog.open(DeleteTemplateDialogComponent, {
      width: '500px',
      height: '210px',
      disableClose: true,
    }).afterClosed()
      .pipe(
        filter((res) => res && !!res),
        switchMap(() => this._ratingService.destroyRatingTemplate(template.id)),
        switchMap(() => this._getRatingTemplates(activityName)),
      ).subscribe();
  }

  private _getRatingTemplates(activityName: ActivityNameModel) {
    return this._ratingService.getRatingTemplates(activityName.id)
      .pipe(
        map((res: any) => {
          return this.templates = res.sort((a, b) => +a.id - +b.id);
        })
      );
  }

}
