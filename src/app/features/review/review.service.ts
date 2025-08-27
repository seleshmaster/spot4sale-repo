import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from './review.models';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private http = inject(HttpClient);
  private baseUrl = '/api/reviews'; // adjust if your backend path is different

  /**
   * Get reviews for a target (store or seller) with optional pagination
   */
  getReviews(
    targetType: 'STORE' | 'SELLER',
    targetId: string,
    page: number = 0,
    pageSize: number = 10
  ): Observable<{ reviews: Review[]; total: number }> {
    const url = `${this.baseUrl}/${targetType}/${targetId}?page=${page}&pageSize=${pageSize}`;
    return this.http.get<{ reviews: Review[]; total: number }>(url);
  }

  /**
   * Submit a new review
   */
  // Removed reviewerId
  submitReview(review: Omit<Review, 'id' | 'createdAt' | 'reviewerId'>): Observable<Review> {
    return this.http.post<Review>(this.baseUrl, review);
  }


  /**
   * Get average rating for a target
   */
  getAverageRating(targetType: 'STORE' | 'SELLER', targetId: string): Observable<number> {
    const url = `${this.baseUrl}/average/${targetType}/${targetId}`;
    return this.http.get<number>(url);
  }

  getReviewCount(targetType: 'STORE' | 'SELLER', targetId: string): Observable<number> {
    const url = `/api/reviews/count/${targetType}/${targetId}`;
    return this.http.get<number>(url);
  }

}
