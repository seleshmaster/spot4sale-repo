// src/app/features/booking/my-bookings.component.ts
import {Component, inject, OnInit, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from './booking.service';
import { Booking } from './booking.models';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
 // selector: 'my-bookings',
  imports: [CommonModule, RouterLink],
  templateUrl: 'my-bookings.component.html',
  styleUrls: ['my-bookings.component.scss']
})

export class MyBookingsComponent implements OnInit {
  private api = inject(BookingService);
  bookings = signal<Booking[]>([]);
  filter = signal<'ALL'|'PENDING'|'PAID'|'CANCELLED'>('ALL');
  busy   = signal<boolean>(false);

  constructor() {
    this.api.mine().subscribe({
      next: b => this.bookings.set(b),
      error: e => console.error('Failed to load bookings', e)
    });
  }

  ngOnInit() {
    this.load(); // initial fetch
  }

  load() {
    this.busy.set(true);
    this.api.mine().subscribe({
      next: (b) => { this.bookings.set(b); this.busy.set(false); },
      error: () => { this.busy.set(false); }
    });
  }


  filtered() {
    const f = this.filter();
    return this.bookings().filter(b => f === 'ALL' || b.status === f);
  }

  cancel(b: Booking) {
    if (!confirm('Cancel this booking?')) return;
    this.busy.set(true);
    this.api.cancel(b.id).subscribe({
      next: updated => {
        // update local state with new status
        this.bookings.set(this.bookings().map(x => x.id === b.id ? updated : x));
        this.busy.set(false);
      },
      error: err => {
        alert(err?.error?.message || 'Failed to cancel booking');
        this.busy.set(false);
      }
    });
  }
}
