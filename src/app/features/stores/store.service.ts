import { Injectable, inject } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {Observable} from 'rxjs';
import {Spot, Store} from './models/store.models';
import {AvailabilityRangeDTO} from './models/availability.models';
import {SeasonDTO} from './models/season.models';
import {StoreSummaryDTO} from './models/store-summary.modles';


export interface CalendarDTO { seasons: SeasonDTO[]; blackouts: string[]; }

@Injectable({ providedIn: 'root' })
export class StoreService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/hosts`;



getCalendar(hostId: string, from: string, to: string) {
  return this.http.get<CalendarDTO>(`${environment.apiBase}/hosts/${hostId}/availability`, { params: { from, to }});
}

  create(payload: Omit<Store, 'id'|'ownerId'>) {
    return this.http.post<Store>(this.base, payload);
  }

  getStore(id: string) {
    return this.http.get<Store>(`${this.base}/${id}`);
  }



  // existing methods…
  searchByCity(city: string): Observable<Store[]> {
    return this.http.get<Store[]>('/api/hosts/search', { params: { city } });
  }
  searchByZip(zip: string): Observable<Store[]> {
    return this.http.get<Store[]>('/api/hosts/search', { params: { zip } });
  }
  nearby(lat: number, lon: number, radiusMeters: number): Observable<Store[]> {
    return this.http.get<Store[]>('/api/hosts/nearby', { params: { lat, lon, radiusMeters } });
  }
  spots(storeId: string): Observable<Spot[]> {
    return this.http.get<Spot[]>(`/api/hosts/${storeId}/spots`);
  }


  createSpot(payload: { storeId: string; pricePerDay: number; available: boolean }) {
    return this.http.post<Spot>(`/api/booths`, payload);
  }


  updateSpot(boothId: string, payload: { pricePerDay?: number; available?: boolean }) {
    return this.http.patch<Spot>(`/api/booths/${boothId}`, payload);
  }


  deleteSpot(boothId: string) {
    return this.http.delete<void>(`/api/booths/${boothId}`);
  }

  /** Fetch availability for a store between [from, to] (YYYY-MM-DD) */
  getAvailability(hostId: string, from: string, to: string): Observable<AvailabilityRangeDTO> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<AvailabilityRangeDTO>(`${environment.apiBase}/hosts/${hostId}/availability`, { params });
  }

  /** Optional convenience: get spot details (must exist in backend as GET /api/spots/{id}) */
  getSpot(boothId: string): Observable<Spot> {
    return this.http.get<Spot>(`${environment.apiBase}/booths/${boothId}`);
  }

  listSeasons(hostId: string) {
    return this.http.get<SeasonDTO[]>(`${environment.apiBase}/hosts/${hostId}/availability/seasons`);
  }
  createSeason(hostId: string, payload: { startDate: string; endDate: string; openWeekdays?: number[]; note?: string; }) {
    return this.http.post<SeasonDTO>(`${environment.apiBase}/hosts/${hostId}/availability/seasons`, payload);
  }
  deleteSeason(hostId: string, seasonId: string) {
    return this.http.delete<void>(`${environment.apiBase}/hosts/${hostId}/availability/seasons/${seasonId}`);
  }

  updateStore(hostId: string, store: Partial<Omit<Store, 'id' | 'ownerId'>>): Observable<Store> {
    return this.http.put<Store>(`${this.base}/${hostId}`, store);
  }


  deleteStore(hostId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${hostId}`);
  }


  getStoresNearby(lat: number, lon: number, radiusKm: number = 10): Observable<StoreSummaryDTO[]> {
    console.log(`Fetching stores near lat=${lat}, lon=${lon}, radius=${radiusKm}km`);
    return this.http.get<StoreSummaryDTO[]>(`/api/hosts/search/nearby`, {
      params: new HttpParams()
        .set('lat', lat)
        .set('lon', lon)        // <-- must match backend parameter name
        .set('radius', radiusKm)
    });
  }

  getStores(): Observable<StoreSummaryDTO[]> {
    return this.http.get<StoreSummaryDTO[]>(`${this.base}/search`);
  }

  searchStoresByCityOrZip(city?: string, zip?: string): Observable<StoreSummaryDTO[]> {
    let params: any = {};
    if (city) params.city = city;
    if (zip) params.zip = zip;

    return this.http.get<StoreSummaryDTO[]>(`${this.base}/search`, { params });
  }

  getStoresPage(city?: string, zip?: string, page: number = 0, size: number = 20) {
    return this.http.get<StoreSummaryDTO[]>(
      `/api/hosts/search?page=${page}&size=${size}` +
      `${city ? `&city=${city}` : ''}` +
      `${zip ? `&zip=${zip}` : ''}`
    );
  }


}
