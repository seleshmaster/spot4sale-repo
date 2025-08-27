import { Injectable, inject } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {Observable} from 'rxjs';
import {Spot, Store} from './store.models';
import {AvailabilityRangeDTO} from './availability.models';
import {SeasonDTO} from './season.models';


export interface CalendarDTO { seasons: SeasonDTO[]; blackouts: string[]; }

@Injectable({ providedIn: 'root' })
export class StoreService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/stores`;



getCalendar(storeId: string, from: string, to: string) {
  return this.http.get<CalendarDTO>(`${environment.apiBase}/stores/${storeId}/availability`, { params: { from, to }});
}

  create(payload: Omit<Store, 'id'|'ownerId'>) {
    return this.http.post<Store>(this.base, payload);
  }

  getStore(id: string) {
    return this.http.get<Store>(`${this.base}/${id}`);
  }



  // existing methods…
  searchByCity(city: string): Observable<Store[]> {
    return this.http.get<Store[]>('/api/stores/search', { params: { city } });
  }
  searchByZip(zip: string): Observable<Store[]> {
    return this.http.get<Store[]>('/api/stores/search', { params: { zip } });
  }
  nearby(lat: number, lon: number, radiusMeters: number): Observable<Store[]> {
    return this.http.get<Store[]>('/api/stores/nearby', { params: { lat, lon, radiusMeters } });
  }
  spots(storeId: string): Observable<Spot[]> {
    return this.http.get<Spot[]>(`/api/stores/${storeId}/spots`);
  }


  createSpot(payload: { storeId: string; pricePerDay: number; available: boolean }) {
    return this.http.post<Spot>(`/api/spots`, payload);
  }


  updateSpot(spotId: string, payload: { pricePerDay?: number; available?: boolean }) {
    return this.http.patch<Spot>(`/api/spots/${spotId}`, payload);
  }


  deleteSpot(spotId: string) {
    return this.http.delete<void>(`/api/spots/${spotId}`);
  }

  /** Fetch availability for a store between [from, to] (YYYY-MM-DD) */
  getAvailability(storeId: string, from: string, to: string): Observable<AvailabilityRangeDTO> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<AvailabilityRangeDTO>(`${environment.apiBase}/stores/${storeId}/availability`, { params });
  }

  /** Optional convenience: get spot details (must exist in backend as GET /api/spots/{id}) */
  getSpot(spotId: string): Observable<Spot> {
    return this.http.get<Spot>(`${environment.apiBase}/spots/${spotId}`);
  }

  listSeasons(storeId: string) {
    return this.http.get<SeasonDTO[]>(`${environment.apiBase}/stores/${storeId}/availability/seasons`);
  }
  createSeason(storeId: string, payload: { startDate: string; endDate: string; openWeekdays?: number[]; note?: string; }) {
    return this.http.post<SeasonDTO>(`${environment.apiBase}/stores/${storeId}/availability/seasons`, payload);
  }
  deleteSeason(storeId: string, seasonId: string) {
    return this.http.delete<void>(`${environment.apiBase}/stores/${storeId}/availability/seasons/${seasonId}`);
  }

  updateStore(storeId: string, store: Store): Observable<Store> {
    return this.http.put<Store>(`${this.base}/${storeId}`, store);
  }

  deleteStore(storeId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${storeId}`);
  }


}
