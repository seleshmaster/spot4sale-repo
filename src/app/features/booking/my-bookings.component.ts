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
  template: `
    <h2>My Bookings</h2>

    <div class="filters">
      <button [class.active]="filter() === 'ALL'" (click)="filter.set('ALL')">All</button>
      <button [class.active]="filter() === 'PENDING'" (click)="filter.set('PENDING')">Pending</button>
      <button [class.active]="filter() === 'PAID'" (click)="filter.set('PAID')">Paid</button>
      <button [class.active]="filter() === 'CANCELLED'" (click)="filter.set('CANCELLED')">Cancelled</button>

      <button class="refresh" (click)="load()" [disabled]="busy()">Refresh</button>
    </div>

    <ul class="list">
      <li *ngFor="let b of filtered()">
        <div class="row">
          <div>
            <div><b>{{ b.startDate }}</b> → <b>{{ b.endDate }}</b></div>
            <div class="muted">Booking ID: {{ b.id }}</div>
          </div>
          <div class="right">
        <span class="badge"
              [class.pending]="b.status==='PENDING'"
              [class.paid]="b.status==='PAID'"
              [class.cancelled]="b.status==='CANCELLED'">
          {{ b.status }}
        </span>
            <div class="total" *ngIf="b.totalPrice != null">
              {{ b.totalPrice | currency:'USD':'symbol':'1.0-0' }}
            </div>
            <a class="link" [routerLink]="['/booking/confirm', b.id]">View / Pay</a>

            <!-- Cancel button inline with each booking -->
            <button
              *ngIf="b.status==='PENDING' || b.status==='PAID'"
              (click)="cancel(b)"
              [disabled]="busy()">
              Cancel
            </button>
          </div>
        </div>
      </li>
    </ul>

    <div *ngIf="filtered().length === 0" class="muted">No bookings found.</div>

  `,
  styles: [`
    .filters { display:flex; gap:8px; margin: 8px 0 16px; }
    .filters button { padding:6px 10px; border:1px solid #e3e3e3; background:#fff; border-radius:6px; cursor:pointer }
    .filters .active { background:#f5f5f5; }
    .list { list-style:none; padding:0; display:grid; gap:12px }
    .row { display:flex; justify-content:space-between; align-items:center; border:1px solid #eee; padding:12px; border-radius:8px }
    .muted { opacity:.7; font-size:12px }
    .right { display:flex; align-items:center; gap:12px }
    .badge { padding:2px 8px; border-radius:12px; font-size:12px; border:1px solid transparent }
    .badge.pending { color:#a76b00; background:#fff6e5; border-color:#ffe0a6 }
    .badge.paid { color:#0a6a2b; background:#e9f8ef; border-color:#bfe6cd; font-weight:600 }
    .badge.cancelled { color:#8b0b0b; background:#fdeaea; border-color:#f4c3c3 }
    .total { font-weight:600 }
    .link { text-decoration:none; font-size:14px }
  `]
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
