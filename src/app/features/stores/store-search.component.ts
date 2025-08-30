import {Component, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from './store.service';
import { Store, Spot } from './store.models';
import {ActivatedRoute, Router} from '@angular/router';
import { ReviewService } from '../review/review.service';
import {ReviewComponent} from '../review/review.component'; // import review API

@Component({
  standalone: true,
  selector: 'store-search',
  imports: [CommonModule, FormsModule, ReviewComponent],
  templateUrl: 'store-search.component.html',
  styleUrls: ['store-search.component.scss']
})
export class StoreSearchComponent implements OnInit {
  private api = inject(StoreService);
  private router = inject(Router);
  private reviewApi = inject(ReviewService);
  private route = inject(ActivatedRoute);



  ngOnInit() {

    this.getCurrentLocation()
      .then(coords => {
        console.log('User location:', coords);


        this.api.getStoresNearby(coords.lat, coords.lng, 10)
          .subscribe(stores => {
            console.log('Nearby stores:', stores);
              this.stores = stores;
          }, err => {
            console.error('Error fetching nearby stores', err);
          });


      })
      .catch(err => {
        console.warn('Location not available, using default', err);
        this.api.getStoresNearby(0, 0); // fallback
      });





    // subscribe to query params whenever they change
    this.route.queryParams.subscribe(params => {

      console.log('StoreSearchComponent queryParams:', params);
      this.city = params['city'] || '';
      this.zip = params['zip'] || '';

      // call search if there is a query
      if (this.city || this.zip) {
        this.onSearch();
      }

      // optional: if using geolocation
      // if (params['lat'] && params['lng']) {
      //   this.api.nearby(+params['lat'], +params['lng'], 5000)
      //     .subscribe(s => this.loadStoresWithReviews(s));
      // }
    });
  }





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


  getCurrentLocation(): Promise<{ lat: number, lng: number }> {
    return new Promise((resolve, reject) => {
      console.log('Attempting to get current location...');
      if (!navigator.geolocation) {
        console.log('Geolocation not supported by this browser.');
        reject('Geolocation not supported');
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('Lat:', position.coords.latitude);
            console.log('Lng:', position.coords.longitude);
          },
          (err) => {
            console.error('Error getting location', err);
          },
          { enableHighAccuracy: true }
        );

        console.log('Requesting current position...');
        console.log('latitude:', navigator.geolocation);
        navigator.geolocation.getCurrentPosition(
          position => resolve({

            lat: position.coords.latitude,
            lng: position.coords.longitude
          }),
          err => reject(err)
        );
      }
    });


  }
}

