import {Component, EventEmitter, inject, Input, OnInit, Output, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService } from './review.service';
import { Review } from './review.models';

@Component({
  standalone: true,
  selector: 'app-review',
  imports: [CommonModule, FormsModule],
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent implements OnInit {
  private api = inject(ReviewService);

  reviews = signal<Review[]>([]);
  newRating = signal<number>(5);
  newComment = signal<string>('');
  busy = signal<boolean>(false);

  page = signal<number>(0);
  pageSize = 5;
  totalPages = signal<number>(0);
  averageRating = signal<number>(0);

  // 🔹 Fix: explicitly type as literal union
  @Input() targetType!: 'STORE' | 'SELLER';
  @Input() targetId!: string;

  @Input() rating = 0; // current rating
  @Input() max = 5;    // max number of stars
  @Output() ratingChange = new EventEmitter<number>();

//  ratingValue = 0;       // the selected rating
  hoverRating = 0;

  hover = 0; // for hover effect

  setRating(value: number) {
    this.rating = value;
    this.ratingChange.emit(this.rating);
  }

  setHover(value: number) {
    this.hover = value;
  }

  resetHover() {
    this.hover = 0;
  }

  ngOnInit() {
    this.loadReviews();
    this.loadAverageRating();
  }

  loadReviews() {
    this.busy.set(true);
    this.api.getReviews(this.targetType, this.targetId, this.page(), this.pageSize)
      .subscribe({
        next: res => {
          this.reviews.set(res.reviews);
          this.totalPages.set(res.total);
          this.busy.set(false);
        },
        error: () => this.busy.set(false)
      });
  }

  loadAverageRating() {
    this.api.getAverageRating(this.targetType, this.targetId)
      .subscribe(avg => this.averageRating.set(avg));
  }

  submitReview() {
    // Validate inputs
    if (!this.newComment() || !this.newRating()) return;

    this.busy.set(true);

    // Send review object without reviewerId
    this.api.submitReview({
      targetType: this.targetType,
      targetId: this.targetId,
      rating: this.newRating(),
      comment: this.newComment()
    }).subscribe({
      next: () => {
        // Reset form
        this.newComment.set('');
        this.newRating.set(5);
        this.loadReviews();
        this.loadAverageRating();
        this.busy.set(false);
      },
      error: () => this.busy.set(false)
    });
  }

// Example method to get current user UUID
  getReviewerId(): string {
    // Replace this with your auth service logic
    return '00000000-0000-0000-0000-000000000000';
  }


  changePage(delta: number) {
    const nextPage = this.page() + delta;
    if (nextPage < 0 || nextPage >= this.totalPages()) return;
    this.page.set(nextPage);
    this.loadReviews();
  }

  get ratingValue(): number {
    return this.newRating();
  }
  set ratingValue(val: number) {
    this.newRating.set(val);
  }

  get commentValue(): string {
    return this.newComment();
  }
  set commentValue(val: string) {
    this.newComment.set(val);
  }

}
