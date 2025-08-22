import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService, Booking } from './booking.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>My Bookings</h2>
    <ul class="list">
      <li *ngFor="let b of bookings()">
        <div><b>{{ b.startDate }} → {{ b.endDate }}</b></div>
        <div>Status: {{ b.status }}</div>
        <div *ngIf="b.totalPrice !== undefined">Total: {{ b.totalPrice | currency:'USD':'symbol':'1.0-0' }}</div>
      </li>
    </ul>
    <p *ngIf="bookings().length === 0" class="muted">No bookings yet.</p>
  `,
  styles:[`.list{list-style:none;padding:0} .muted{opacity:.7}`]
})
export class BookingsListComponent {
  private api = inject(BookingService);
  private _bookings = signal<Booking[]>([]);
  bookings = computed(() => this._bookings());

  ngOnInit() { this.api.mine().subscribe(b => this._bookings.set(b)); }
}
