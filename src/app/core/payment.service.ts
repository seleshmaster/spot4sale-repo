import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  private stripePromise = loadStripe(environment.stripePublishableKey);

  async mountForBooking(bookingId: string) {
    // 1) ask backend for clientSecret (computed from booking)
    try {
      const resp = await firstValueFrom(
        this.http.post<{ clientSecret: string }>(
          `${environment.apiBase}/payments/intent`,
          { bookingId }
        )
      );
      const clientSecret = resp.clientSecret;

      const stripe = await this.stripePromise;
      if (!stripe || !clientSecret) throw new Error('Stripe not initialized');

      // 2) create Elements + mount
      const elements = stripe.elements({ clientSecret });
      const paymentElement = elements.create('payment');
      paymentElement.mount('#payment-element');

      // 3) on submit, confirm
      const form = document.getElementById('payment-form') as HTMLFormElement;
      form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const { error } = await stripe.confirmPayment({
          elements,
          confirmParams: { return_url: window.location.origin + '/bookings' }
        });
        if (error) alert(error.message);
      });
      // ... (continue with Stripe Elements)
    } catch (e: any) {
      const msg =
        e?.error?.message || e?.message || `HTTP ${e?.status} ${e?.statusText}`;
      console.error('Init payment failed:', e);
      alert('Init payment failed: ' + msg);
    }
  }
}
