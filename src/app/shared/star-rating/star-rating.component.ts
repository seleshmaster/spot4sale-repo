import {Component, Input, OnChanges} from '@angular/core';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faStar as solidStar, faStarHalfAlt as halfStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as regularStar } from '@fortawesome/free-regular-svg-icons';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-star-rating',
  templateUrl: './star-rating.component.html',
  imports: [
    FaIconComponent
  ],
  styleUrls: ['./star-rating.component.scss']
})
export class StarRatingComponent implements OnChanges {
  @Input() rating: number = 0;
  @Input() maxStars: number = 5;
  stars: ('full' | 'half' | 'empty')[] = [];

  ngOnChanges() {
    //this.stars = this.getStars(this.rating);
    this.stars = this.getStars(this.rating);
  }

  private getStars(rating: number): ('full' | 'half' | 'empty')[] {
    const stars: ('full' | 'half' | 'empty')[] = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push('full');
      } else if (rating >= i - 0.5) {
        stars.push('half');
      } else {
        stars.push('empty');
      }
    }
    return stars;
  }


  solidStar: IconDefinition = solidStar;
  halfStar: IconDefinition = halfStar;
  emptyStar: IconDefinition = regularStar;

  // get stars(): IconDefinition[] {
  //   const starsArray: IconDefinition[] = [];
  //   let remaining = this.rating;
  //
  //   for (let i = 0; i < this.maxStars; i++) {
  //     if (remaining >= 1) {
  //       starsArray.push(this.solidStar);
  //     } else if (remaining >= 0.5) {
  //       starsArray.push(this.halfStar);
  //     } else {
  //       starsArray.push(this.emptyStar);
  //     }
  //     remaining -= 1;
  //   }
  //
  //   return starsArray;
  // }

}
