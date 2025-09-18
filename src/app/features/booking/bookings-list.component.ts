import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from './booking.service';
import {Booking} from './modles/booking.models';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bookings-list.component.html',
  styleUrls: ['./bookings-list.component.scss']
})
export class BookingsListComponent {
  private api = inject(BookingService);
  private _bookings = signal<Booking[]>([]);
  bookings = computed(() => this._bookings());

  ngOnInit() { this.api.mine().subscribe(b => this._bookings.set(b)); }
}
