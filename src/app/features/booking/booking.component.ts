// src/app/features/booking/booking.component.ts
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import {BookingService} from './booking.service';

@Component({
  standalone: true, imports: [CommonModule,FormsModule],
  template: `
    <h2>Book Spot</h2>
    <p>Spot: {{ spotId }}</p>

    <form (ngSubmit)="submit()">
      <label>Start <input type="date" [(ngModel)]="start" name="start" required /></label>
      <label>End   <input type="date" [(ngModel)]="end"   name="end"   required /></label>
      <button [disabled]="busy()">Reserve</button>
    </form>

    <p class="ok" *ngIf="ok()">{{ ok() }}</p>
    <p class="err" *ngIf="err()">{{ err() }}</p>
  `,
  styles:[`.ok{color:#0a7a0a}.err{color:#b00020}`]
})
export class BookingComponent {
  private ar = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private router = inject(Router);

  spotId = this.ar.snapshot.paramMap.get('spotId')!;
  start = ''; end = '';
  private _busy = signal(false); busy = computed(()=>this._busy());
  private _ok = signal<string|null>(null); ok = computed(()=>this._ok());
  private _err = signal<string|null>(null); err = computed(()=>this._err());

  constructor(/* ... */ private bookings: BookingService) {}

  submit(){
    if (!this.start || !this.end) return;
    this._busy.set(true); this._ok.set(null); this._err.set(null);

    this.bookings.create({ spotId: this.spotId, startDate: this.start, endDate: this.end })
      .subscribe({
        next: (b) => { this._busy.set(false); this._ok.set('Reserved!');
          // go to confirmation
          this.router.navigate(['/booking/confirm', b.id]); },
        error: (e) => { this._busy.set(false); this._err.set(e?.error?.message || 'Could not reserve'); }
      });
  }
}
