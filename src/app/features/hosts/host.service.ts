import { Injectable, inject } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {Observable} from 'rxjs';
import {Booth, Host} from './models/host.models';
import {AvailabilityRangeDTO} from './models/availability.models';
import {SeasonDTO} from './models/season.models';
import {HostSummaryDTO} from './models/host-summary.modles';


export interface CalendarDTO { seasons: SeasonDTO[]; blackouts: string[]; }

@Injectable({ providedIn: 'root' })
export class HostService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/hosts`;



getCalendar(hostId: string, from: string, to: string) {
  return this.http.get<CalendarDTO>(`${environment.apiBase}/hosts/${hostId}/availability`, { params: { from, to }});
}

  create(payload: Omit<Host, 'id'|'ownerId'>) {
    return this.http.post<Host>(this.base, payload);
  }

  getHost(id: string) {
    return this.http.get<Host>(`${this.base}/${id}`);
  }



  // existing methods…
  searchByCity(city: string): Observable<Host[]> {
    return this.http.get<Host[]>('/api/hosts/search', { params: { city } });
  }
  searchByZip(zip: string): Observable<Host[]> {
    return this.http.get<Host[]>('/api/hosts/search', { params: { zip } });
  }
  nearby(lat: number, lon: number, radiusMeters: number): Observable<Host[]> {
    return this.http.get<Host[]>('/api/hosts/nearby', { params: { lat, lon, radiusMeters } });
  }
  booths(storeId: string): Observable<Booth[]> {
    return this.http.get<Booth[]>(`/api/hosts/${storeId}/spots`);
  }


  createBooth(payload: { storeId: string; pricePerDay: number; available: boolean }) {
    return this.http.post<Booth>(`/api/booths`, payload);
  }


  updateBooth(boothId: string, payload: { pricePerDay?: number; available?: boolean }) {
    return this.http.patch<Booth>(`/api/booths/${boothId}`, payload);
  }


  deleteBooth(boothId: string) {
    return this.http.delete<void>(`/api/booths/${boothId}`);
  }

  /** Fetch availability for a store between [from, to] (YYYY-MM-DD) */
  getAvailability(hostId: string, from: string, to: string): Observable<AvailabilityRangeDTO> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<AvailabilityRangeDTO>(`${environment.apiBase}/hosts/${hostId}/availability`, { params });
  }

  /** Optional convenience: get spot details (must exist in backend as GET /api/spots/{id}) */
  getBooth(boothId: string): Observable<Booth> {
    return this.http.get<Booth>(`${environment.apiBase}/booths/${boothId}`);
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

  updateStore(hostId: string, store: Partial<Omit<Host, 'id' | 'ownerId'>>): Observable<Host> {
    return this.http.put<Host>(`${this.base}/${hostId}`, store);
  }


  deleteStore(hostId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${hostId}`);
  }


  getStoresNearby(lat: number, lon: number, radiusKm: number = 10): Observable<HostSummaryDTO[]> {
    console.log(`Fetching stores near lat=${lat}, lon=${lon}, radius=${radiusKm}km`);
    return this.http.get<HostSummaryDTO[]>(`/api/hosts/search/nearby`, {
      params: new HttpParams()
        .set('lat', lat)
        .set('lon', lon)        // <-- must match backend parameter name
        .set('radius', radiusKm)
    });
  }

  getStores(): Observable<HostSummaryDTO[]> {
    return this.http.get<HostSummaryDTO[]>(`${this.base}/search`);
  }

  searchStoresByCityOrZip(city?: string, zip?: string): Observable<HostSummaryDTO[]> {
    let params: any = {};
    if (city) params.city = city;
    if (zip) params.zip = zip;

    return this.http.get<HostSummaryDTO[]>(`${this.base}/search`, { params });
  }

  getHostsPage(city?: string, zip?: string, page: number = 0, size: number = 20) {
    return this.http.get<HostSummaryDTO[]>(
      `/api/hosts/search?page=${page}&size=${size}` +
      `${city ? `&city=${city}` : ''}` +
      `${zip ? `&zip=${zip}` : ''}`
    );
  }
}
