import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from './store.service';
import { Store, Spot } from './store.models';
import { Router } from '@angular/router';
import { ReviewService } from '../review/review.service';
import {ReviewComponent} from '../review/review.component'; // import review API

@Component({
  standalone: true,
  selector: 'store-search',
  imports: [CommonModule, FormsModule, ReviewComponent],
  templateUrl: 'store-search.component.html',
  styleUrls: ['store-search.component.scss']
})
export class StoreSearchComponent {
  private api = inject(StoreService);
  private router = inject(Router);
  private reviewApi = inject(ReviewService);

  city = '';
  zip = '';
  stores: Store[] = [];
  spots: Record<string, Spot[]> = {};

  onSearch() {
    if (this.city.trim()) {
      this.api.searchByCity(this.city.trim()).subscribe(s => this.loadStoresWithReviews(s));
      return;
    }
    if (this.zip.trim()) {
      this.api.searchByZip(this.zip.trim()).subscribe(s => this.loadStoresWithReviews(s));
      return;
    }
    this.stores = [];
  }

  useMyLocation() {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        this.api.nearby(coords.latitude, coords.longitude, 5000)
          .subscribe(s => this.loadStoresWithReviews(s));
      },
      err => alert('Could not get location: ' + err.message)
    );
  }

  loadSpots(store: Store) {
    if (!store.id || this.spots[store.id]) return;
    this.api.spots(store.id).subscribe(ss => this.spots[store.id] = ss);
  }

  book(storeId: string, spotId: string) {
    this.router.navigate(['/book', spotId], { queryParams: { storeId } });
  }

  // -------------------------
  // REVIEW INTEGRATION
  // -------------------------

  private loadStoresWithReviews(stores: Store[]) {
    this.stores = stores.map(s => ({
      ...s,
      averageRating: 0,
      reviewCount: 0,
      showReviews: false
    }));

    // fetch average ratings and review counts for all stores
    for (const s of this.stores) {
      if (s.id) {
        this.reviewApi.getAverageRating('STORE', s.id).subscribe(avg => s.averageRating = avg);
        this.reviewApi.getReviewCount('STORE', s.id).subscribe(count => s.reviewCount = count);
      }
    }
  }

  toggleReviews(store: Store) {
    store.showReviews = !store.showReviews;
  }

  // In StoreSearchComponent
  selectedImage: string | null = null;

  openImage(url: string) {
    this.selectedImage = url;
  }

  closeImage() {
    this.selectedImage = null;
  }

}
