import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {DecimalPipe, NgForOf} from '@angular/common';
import { HostService } from './host.service';
import {HostSummaryDTO} from './models/host-summary.modles';


@Component({
  selector: 'app-store-list',
  templateUrl: './host-list.component.html',
  imports: [DecimalPipe, NgForOf],
  styleUrls: ['./host-list.component.scss']
})
export class HostListComponent implements OnInit {
  storesSummaryDtos: HostSummaryDTO[] = [];
  searchCity: string = '';
  searchZip: string = '';

  constructor(private api: HostService, private router: Router) {}

  ngOnInit() {
    // Try geolocation first
    this.getCurrentLocation()
      .then(coords => {
        console.log('User location:', coords);

        this.api.getStoresNearby(coords.lat, coords.lng, 5000) // 5km radius default
          .subscribe(
            stores => this.storesSummaryDtos = stores,
            err => {
              console.error('Error fetching nearby stores', err);
              this.fetchHostsPage();
            }
          );
      })
      .catch(err => {
        console.warn('Location not available, using fallback', err);
        this.fetchHostsPage();
      });
  }

  // Fallback: fetch all stores without geolocation
  currentPage = 0;
  pageSize = 20;
  loading = false;

  fetchHostsPage(city?: string, zip?: string) {
    if (this.loading) return;
    this.loading = true;

    this.api.getHostsPage(city, zip, this.currentPage, this.pageSize)
      .subscribe(stores => {
        this.storesSummaryDtos.push(...stores);
        if (stores.length === this.pageSize) this.currentPage++;
        this.loading = false;
      }, err => this.loading = false);
  }

  // Search stores by city or zip code
  searchStores(): void {
    if (!this.searchCity && !this.searchZip) {
      this.fetchHostsPage();
      return;
    }

    this.api.searchStoresByCityOrZip(this.searchCity, this.searchZip)
      .subscribe(
        stores => this.storesSummaryDtos = stores,
        err => console.error('Error searching stores', err)
      );
  }

  // Navigate to store detail page
  goToDetail(storeId: string): void {
    this.router.navigate(['/store', storeId]);
  }

  // Geolocation helper
  getCurrentLocation(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocation not supported');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
        err => reject(err),
        { enableHighAccuracy: true }
      );
    });
  }
}
