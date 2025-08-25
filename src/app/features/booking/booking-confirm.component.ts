import {Component, inject, signal, computed, AfterViewInit, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {BookingService, BookingDetails} from './booking.service';
import { PaymentService } from '../../core/payment.service';
import { switchMap } from 'rxjs/operators';
import { StoreService } from '../stores/store.service';
import {Booking} from './booking.models'; // adjust path to your service


@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl:'./booking-confirm.component.html' ,
  styleUrls: ['./booking-confirm.component.scss']
})
export class BookingConfirmComponent implements OnInit, AfterViewInit {
  private storeSvc = inject(StoreService);
  private ar = inject(ActivatedRoute);
  private api = inject(BookingService);
  private pay = inject(PaymentService);
  private router = inject(Router);
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

  // call this after Stripe confirms success
  private async onPaymentSucceeded() {
    // 1) pull fresh data so the list is up to date
    await this.api.mine().toPromise(); // if you keep local store in service, update it there
    // 2) navigate to list (optional)
    this.router.navigate(['/bookings']);
  }

  // wherever you handle the Stripe confirm result:
  async handleStripeSubmit(elements: any) {
    const { error, paymentIntent } = await (window as any).stripe.confirmPayment({ elements, confirmParams: {} });
    if (!error && paymentIntent?.status === 'succeeded') {
      await this.onPaymentSucceeded();
    }
  }
}
