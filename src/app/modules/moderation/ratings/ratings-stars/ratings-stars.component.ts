import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'b2b-rating-star',
  templateUrl: './ratings-stars.component.html',
  styleUrls: ['./ratings-stars.component.scss']

})
export class RatingsStarsComponent implements OnChanges {
  @Input() rating: number;
  @Input() format: string;
  full = '<i class="material-icons">star</i>';
  half = '<i class="material-icons">star_half</i>';
  empty = '<i class="fa fa-star-o"></i>';
  fullStars: string;
  allStars: string;

  private maxRating = 5;

  ngOnChanges() {
    const countOfFull = Math.floor(this.rating);
    const countOfHalf = Math.ceil(this.rating - countOfFull);
    const countOfEmpty = this.maxRating - countOfFull - countOfHalf;

    const fullsArray = Array(countOfFull).fill(this.full);
    const halfArray = Array(countOfHalf).fill(this.half);
    const emptyArray = Array(countOfEmpty).fill(this.empty);

    this.fullStars = [].concat(fullsArray, halfArray).join('');
    this.allStars = this.fullStars + emptyArray.join('');
  }

}
