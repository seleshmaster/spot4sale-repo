// src/app/features/owner/owner.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {Spot, Store} from '../stores/store.models';


export interface Booking {
  id: string; spotId: string; startDate: string; endDate: string;
  status: 'PENDING'|'PAID'|'CONFIRMED'|'CANCELLED'|'COMPLETED';
  totalPrice?: number; userId?: string;
}

@Injectable({ providedIn: 'root' })
export class OwnerService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/owner`;

  myStores() {
    return this.http.get<Store[]>(`${this.base}/stores`);
  }
  spots(storeId: string) {
    return this.http.get<Spot[]>(`${this.base}/stores/${storeId}/spots`);
  }
  bookings(storeId: string) {
    return this.http.get<Booking[]>(`${this.base}/stores/${storeId}/bookings`);
  }
  updateBookingStatus(storeId: string, bookingId: string, status: string) {
    return this.http.patch<Booking>(`${this.base}/stores/${storeId}/bookings/${bookingId}/status`, null, {
      params: { status }
    });
  }
}
