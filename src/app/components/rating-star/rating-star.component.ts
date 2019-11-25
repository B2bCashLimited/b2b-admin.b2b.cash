import { Component, OnInit, Input, OnChanges, OnDestroy, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ConfigService } from '@b2b/services/config.service';
import { UserService } from '@b2b/services/user.service';
import { RatingService } from '@b2b/services/rating.service';

@Component({
  selector: 'b2b-rating-stars',
  templateUrl: './rating-star.component.html',
  styleUrls: ['./rating-star.component.scss']

})
export class RatingStarComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  set rating(value) {
    this._rating = Math.min(value * this.ratingCoefficient, this.maxRating);
  }
  get rating() {
    return this._rating || 0;
  }
  @Input() format = 'full';
  @Input() companyId: number;
  @Input() activityId: number;
  @Input() details: boolean | string; // показывать ли попап

  private subs = new Subscription();
  private maxRating = 5;
  private ratingCoefficient = 0.25;
  private _rating: number;
  private language = this._config.locale;

  public fullStars: string;
  public allStars: string;
  public isPopup = false;
  public isFetched = false;
  public isLoading = false;

  public questionLocale = 'question' + this.language;
  public answerLocale = 'answer' + this.language;

  public isActivityPartVisible = false;
  public isQuizPartVisible = false;
  public orientationClass = 'orient-right';

  public $activityResults = new BehaviorSubject({
    orders: undefined,
    offers: undefined,
    deals: undefined,
  });
  public $questions = new BehaviorSubject([]);
  private currentUser = this._userService.currentUser;

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private _http: HttpClient,
    private _config: ConfigService,
    private _el: ElementRef,
    private _ratingService: RatingService,
    private _userService: UserService,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.calculateOrientation();
    }
  }

  ngOnChanges() {
    this.renderStars();
  }

  private renderStars() {
    // число полных звезд
    const countOfFull = Math.floor(this._rating) || 0;
    // число полузвезд
    const countOfHalf = Math.ceil(this._rating - countOfFull) || 0;
    // число пустых звезд
    const countOfEmpty = (this.maxRating - countOfFull - countOfHalf) || 0;

    const fullsArray = Array(countOfFull).fill('<i class="fa fa-star"></i>');
    const halfArray = Array(countOfHalf).fill('<i class="fa fa-star-half-o"></i>');
    const emptyArray = Array(countOfEmpty).fill('<i class="fa fa-star-o"></i>');

    this.fullStars = [].concat(fullsArray, halfArray).join('');
    this.allStars = this.fullStars + emptyArray.join('');
  }

  private calculateOrientation() {
    const { x, y } = this._el.nativeElement.getBoundingClientRect();
    // если есть какой то элемент в 360 пикселях справа, то рисуем окошко вправо
    const elem = this.document.elementFromPoint(x + 360, 10);
    if (elem) {
      this.orientationClass = 'orient-right';
    } else {
      this.orientationClass = 'orient-left';
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  public show() {
    if (!(this.currentUser && this.currentUser.id)) {
      return;
    }

    if (!this.details) {
      return;
    }
    this.getRatingDetails();
    this.isPopup = true;
  }

  public hide() {
    this.isPopup = false;
  }

  private getRatingDetails() {
    if (this.isFetched || this.isLoading) {
      return;
    }
    this.isLoading = true;
    const sub = this._ratingService.getRatingDetails({
      companyId: this.companyId,
      activityId: this.activityId
    }).subscribe((ratingDetails: any) => {
        this.isLoading = false;
        this.isFetched = true;

        const questions = ratingDetails && ratingDetails.quizResults;
        const activityResults = ratingDetails && ratingDetails.activityResults[0];

        if (questions.length) {
          this.$questions.next(questions);
          this.isQuizPartVisible = true;
        }

        if (activityResults) {
          this.$activityResults.next(activityResults);
          this.isActivityPartVisible = true;
        }
      });
    this.subs.add(sub);
  }

}
