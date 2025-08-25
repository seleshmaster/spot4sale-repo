import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from './store.service';
import { Store, Spot } from './store.models';
import { Router } from '@angular/router';


@Component({
  standalone: true,
  selector: 'store-search',
  imports: [CommonModule, FormsModule],
  templateUrl: 'store-search.component.html',
  styleUrls: ['store-search.component.scss']
})
export class StoreSearchComponent {
  private api = inject(StoreService);
  private router = inject(Router);
  city = ''; zip = '';
  stores: Store[] = [];
  spots: Record<string, Spot[]> = {};

  onSearch(){
    if (this.city.trim()) { this.api.searchByCity(this.city.trim()).subscribe(s => this.stores = s); return; }
    if (this.zip.trim())  { this.api.searchByZip(this.zip.trim()).subscribe(s => this.stores = s); return; }
    this.stores = [];
  }

  useMyLocation(){
    if (!navigator.geolocation) { alert('Geolocation not supported'); return; }
    navigator.geolocation.getCurrentPosition(({coords}) => {
      this.api.nearby(coords.latitude, coords.longitude, 5000).subscribe(s => this.stores = s);
    }, err => alert('Could not get location: ' + err.message));
  }

  loadSpots(store: Store){
    if (!store.id || this.spots[store.id]) return;
    this.api.spots(store.id).subscribe(ss => this.spots[store.id] = ss);
  }

  book(storeId: string, spotId: string) {
    this.router.navigate(['/book', spotId], { queryParams: { storeId } });
  }
}
