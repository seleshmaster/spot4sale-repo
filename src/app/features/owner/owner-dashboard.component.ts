// src/app/features/owner/owner-dashboard.component.ts
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OwnerService, Booking } from './owner.service';
import { FormsModule } from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {Store} from '../stores/store.models';
import {StoreService} from '../stores/store.service';

@Component({
  standalone: true,
  selector: 'owner-dashboard',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: 'owner-dashboard.component.html',
  styleUrls: ['owner-dashboard.component.scss']
})
export class OwnerDashboardComponent {
  private api = inject(OwnerService);
  private router: Router = inject(Router);
  private storeService: StoreService = inject(StoreService);
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

  updateStore(store: Store, event: Event) {
    event.stopPropagation();
    console.log('updateStore called ------ ', store.id);
    // Correct path syntax using string interpolation
    this.router.navigate([`/stores/${store.id}/edit`]);
  }


  deleteStore(store: Store, event: MouseEvent) {
    event.stopPropagation();

    if (!confirm(`Are you sure you want to delete store "${store.name}"?`)) return;

    this.storeService.deleteStore(store.id).subscribe({
      next: () => {
        alert('Store deleted!');

        // Update the stores signal
        this.stores.update(currentStores => currentStores.filter(s => s.id !== store.id));

        // Deselect if the deleted store was selected
        if (this.selectedId() === store.id) {
          this.selectedId.set(''); // empty string means no selection
        }
      },
      error: (err) => {
        console.error(err);
        alert('Failed to delete store.');
      }
    });
  }

}
