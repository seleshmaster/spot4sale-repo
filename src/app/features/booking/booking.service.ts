import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from '../../../environments/environment';
import {Booking, BookingDetails} from './modles/booking.models';



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

  cancel(id: string) {
    return this.http.post<Booking>(`${environment.apiBase}/bookings/${id}/cancel`, {});
  }
}
