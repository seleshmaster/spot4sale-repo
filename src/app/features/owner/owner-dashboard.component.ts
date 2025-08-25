// src/app/features/owner/owner-dashboard.component.ts
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OwnerService, Booking } from './owner.service';
import { FormsModule } from '@angular/forms';
import {RouterLink} from '@angular/router';
import {Store} from '../stores/store.models';

@Component({
  standalone: true,
  selector: 'owner-dashboard',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: 'owner-dashboard.component.html',
  styleUrls: ['owner-dashboard.component.scss']
})
export class OwnerDashboardComponent {
  private api = inject(OwnerService);
  stores = signal<Store[]>([]);
  selectedId = signal<string>('');
  bookings = signal<Booking[]>([]);

  constructor(){
    this.api.myStores().subscribe(s => {
      this.stores.set(s);
      if (s.length) this.select(s[0]);
    });
  }

  select(s: Store){
    this.selectedId.set(s.id);
    this.api.bookings(s.id).subscribe(b => this.bookings.set(b));
  }

  setStatus(b: Booking, status: string){
    const storeId = this.selectedId();
    this.api.updateBookingStatus(storeId, b.id, status).subscribe(updated => {
      this.bookings.update(list => list.map(x => x.id === b.id ? updated : x));
    });
  }
}
