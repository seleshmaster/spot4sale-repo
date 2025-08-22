import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from './store.service';
import { Store, Spot } from './store.models';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'store-search',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <h2>Find a store</h2>

    <form class="search-form" (ngSubmit)="onSearch()">
      <input type="text" [(ngModel)]="city" name="city" placeholder="City (e.g., San Francisco)"/>
      <input type="text" [(ngModel)]="zip" name="zip" placeholder="ZIP (e.g., 94110)"/>
      <button type="submit">Search</button>
      <button type="button" (click)="useMyLocation()">Use my location</button>
    </form>

    <div *ngIf="stores && stores.length === 0" class="muted">No stores found.</div>

    <ul class="store-list">
      <li *ngFor="let s of stores" (click)="loadSpots(s)" class="store">
        <div class="title">{{ s.name }}</div>
        <div class="meta">
          <span *ngIf="s.city">{{ s.city }}</span>
          <span *ngIf="s.zipCode">• {{ s.zipCode }}</span>
          <span *ngIf="s.averageRating !== undefined">• ★ {{ s.averageRating }} ({{ s.reviewCount || 0 }})</span>
        </div>

        <div *ngIf="spots[s.id]" class="spots" (click)="$event.stopPropagation()">
          <div *ngFor="let sp of spots[s.id]" class="spot">
            <span>\${{ sp.pricePerDay }}/day</span>
            <span [class.bad]="!sp.available">{{ sp.available ? 'Available' : 'Unavailable' }}</span>
            <button type="button" [routerLink]="['/book', sp.id]" [disabled]="!sp.available">Book</button>
          </div>
        </div>
      </li>
    </ul>
  `,
  styles: [`
    .search-form{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap}
    input{padding:8px;min-width:220px}
    .muted{opacity:.7}
    .store-list{list-style:none;padding:0;margin:0;display:grid;gap:10px}
    .store{border:1px solid #ececec;border-radius:8px;padding:10px;cursor:pointer}
    .title{font-weight:600}
    .meta{font-size:12px;opacity:.8}
    .spots{display:flex;gap:12px;margin-top:8px;flex-wrap:wrap}
    .spot{border:1px solid #eee;padding:6px 10px;border-radius:6px;font-size:13px}
    .bad{color:#b00020}
  `]
})
export class StoreSearchComponent {
  private api = inject(StoreService);
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
}
