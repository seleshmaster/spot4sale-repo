import { Component, inject, signal, computed, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {BookingService, BookingDetails} from './booking.service';
import { PaymentService } from '../../core/payment.service';
import { switchMap } from 'rxjs/operators';
import { StoreService } from '../stores/store.service';
import {Booking} from './booking.models'; // adjust path to your service


@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <h2>Booking confirmed</h2>

    <ng-container *ngIf="details(); else loading">
      <p><b>Booking ID:</b> {{ details()!.id }}</p>
      <p *ngIf="details()!.store"><b>Store:</b> {{ details()!.store.name }}</p>
      <p><b>Dates:</b> {{ details()!.startDate }} → {{ details()!.endDate }}</p>
      <p *ngIf="details()!.totalPrice != null">
        <b>Total:</b> {{ details()!.totalPrice | currency:'USD':'symbol':'1.0-0' }}
      </p>
      <p>
        <b>Status:</b>
        <span class="badge"
              [class.paid]="details()!.status === 'PAID'"
              [class.pending]="details()!.status !== 'PAID'">
      {{ details()!.status }}
    </span>
      </p>

      <hr/>
      <h3>Pay now</h3>
      <form id="payment-form">
        <div id="payment-element"></div>
        <button type="submit">Pay</button>
      </form>

      <p class="muted">After payment succeeds, your booking status will update to PAID.</p>
      <p><a routerLink="/bookings">Go to My Bookings</a></p>
    </ng-container>


    <ng-template #loading>
      <p>Loading booking details…</p>
    </ng-template>
  `,
  styles: [`
    .summary { margin-bottom: 8px; }
    .badge { padding: 2px 8px; border-radius: 12px; font-size: 12px; }
    .badge.paid { background: #e6ffed; color: #136f2d; }
    .badge.pending { background: #fff7e6; color: #8a5a00; }
    .muted { opacity: .75; }
  `]
})
export class BookingConfirmComponent implements AfterViewInit {
  private storeSvc = inject(StoreService);
  private ar = inject(ActivatedRoute);
  private api = inject(BookingService);
  private pay = inject(PaymentService);
  private _b = signal<Booking | null>(null);
  booking = computed(() => this._b());
  storeName?: string;

  private _details = signal<BookingDetails | null>(null);
  details = computed(() => this._details());

  ngOnInit() {
    const id = this.ar.snapshot.paramMap.get('id')!;
    this.api.getDetails(id).subscribe(d => this._details.set(d));
    this.api.get(id).subscribe(b => {
      this._b.set(b);

      // fetch store name via spotId -> storeId -> store
      // this.storeSvc.getSpot(b.spotId).pipe(
      //   switchMap(spot => this.storeSvc.getStore(spot.storeId))
      // ).subscribe(store => this.storeName = store.name);
    });
  }

  async ngAfterViewInit() {
    const id = this.ar.snapshot.paramMap.get('id')!;
    await this.pay.mountForBooking(id);
  }
}
