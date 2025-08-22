import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from '../../../environments/environment';
import {Booking} from './booking.models';



export interface StoreSummary {
  id: string;
  name: string;
  address?: string;
  city?: string;
  zipCode?: string;
}
export interface SpotSummary {
  id: string;
  storeId: string;
  pricePerDay: number;
  available: boolean;
}
export interface BookingDetails {
  id: string;
  userId: string;
  spotId: string;
  startDate: string;
  endDate: string;
  status: string;
  totalPrice: number; // or string if BigDecimal serialized as string
  store: StoreSummary;
  spot: SpotSummary;
}


@Injectable({ providedIn: 'root' })
export class BookingService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/bookings`;

  create(payload: { spotId: string; startDate: string; endDate: string }): Observable<Booking> {
    return this.http.post<Booking>('/api/bookings', payload);
  }

  getDetails(id: string) {
    return this.http.get<BookingDetails>(`${this.base}/${id}/details`);
  }

  mine(): Observable<Booking[]> {
    return this.http.get<Booking[]>('/api/bookings/me');
  }

  get(id: string): Observable<Booking> {
    return this.http.get<Booking>(`/api/bookings/${id}`);
  }
}
