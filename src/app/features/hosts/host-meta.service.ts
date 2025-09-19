import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HostType {
  id: string;
  name: string;
}

export interface HostCategory {
  id: string;
  name: string;
}

export interface Amenity {
  id: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class HostMetaService {

  constructor(private http: HttpClient) {}

  getHostTypes(): Observable<HostType[]> {
    return this.http.get<HostType[]>('/api/hosts/types');
  }

  getHostCategories(): Observable<HostCategory[]> {
    return this.http.get<HostCategory[]>('/api/hosts/categories');
  }

  getAmenities(): Observable<Amenity[]> {
    return this.http.get<Amenity[]>('/api/amenities');
  }
}
