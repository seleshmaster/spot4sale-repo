import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OwnerService, Booking } from './owner.service';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Host } from '../hosts/models/host.models';
import { HostService } from '../hosts/host.service';

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
  private storeService: HostService = inject(HostService);

  stores = signal<Host[]>([]);
  selectedId = signal<string>('');
  bookings = signal<Booking[]>([]);
  loadingStores = signal(true);
  loadingBookings = signal(false);

  currentIndex = signal(0);

  constructor() {
    // Load stores
    this.api.myHosts().subscribe(s => {
      this.stores.set(s);
      this.loadingStores.set(false);

      if (s.length) this.select(s[0]);
    });
  }

  select(s: Host) {
    this.selectedId.set(s.id);
    this.loadingBookings.set(true);

    // Load bookings for selected store
    this.api.bookings(s.id).subscribe(b => {
      this.bookings.set(b);
      this.loadingBookings.set(false);
    });

    // Update current index
    const index = this.stores().findIndex(store => store.id === s.id);
    if (index >= 0) this.currentIndex.set(index);
  }

  setStatus(b: Booking, status: string) {
    const storeId = this.selectedId();
    this.api.updateBookingStatus(storeId, b.id, status).subscribe(updated => {
      this.bookings.update(list => list.map(x => x.id === b.id ? updated : x));
    });
  }

  updateHost(store: Host, event: Event) {
    event.stopPropagation();
    this.router.navigate([`/stores/${store.id}/edit`]);
  }

  deleteHost(store: Host, event: MouseEvent) {
    event.stopPropagation();

    if (!confirm(`Are you sure you want to delete store "${store.name}"?`)) return;

    this.storeService.deleteStore(store.id).subscribe({
      next: () => {
        alert('Store deleted!');
        this.stores.update(currentStores => currentStores.filter(s => s.id !== store.id));

        if (this.selectedId() === store.id) {
          const newIndex = Math.min(this.currentIndex(), this.stores().length - 1);
          if (newIndex >= 0) this.select(this.stores()[newIndex]);
          else {
            this.selectedId.set('');
            this.bookings.set([]);
          }
        }
      },
      error: err => {
        console.error(err);
        alert('Failed to delete store.');
      }
    });
  }

  prevHost() {
    if (this.currentIndex() > 0) {
      this.currentIndex.update(i => i - 1);
      this.select(this.stores()[this.currentIndex()]);
    }
  }

  nextHost() {
    if (this.currentIndex() < this.stores().length - 1) {
      this.currentIndex.update(i => i + 1);
      this.select(this.stores()[this.currentIndex()]);
    }
  }
}
