// src/app/features/booking/booking.component.ts
import {Component, inject, signal, computed, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import {BookingService} from './booking.service';
import {AvailabilityRangeDTO} from '../stores/availability.models';
import {StoreService} from '../stores/store.service';

@Component({
  standalone: true, imports: [CommonModule,FormsModule],
  template: `
    <h2>Reserve Spot</h2>

    <form (ngSubmit)="submit()">
      <div class="row">
        <label>Start date</label>
        <input type="date" [(ngModel)]="start" name="start" required>
      </div>

      <div class="row">
        <label>End date</label>
        <input type="date" [(ngModel)]="end" name="end" required>
      </div>

      <div class="hint" *ngIf="blockedList.length > 0">
        Some dates are unavailable and will be rejected:
        <code>{{ blockedList.slice(0,5).join(', ') }}<span *ngIf="blockedList.length > 5">, …</span></code>
      </div>

      <div class="hint" *ngIf="openWeekdaysList.length > 0">
        Open days (1=Mon…7=Sun):
        <code>{{ openWeekdaysList.slice().sort().join(',') }}</code>
      </div>

      <div class="err" *ngIf="err">{{ err }}</div>
      <div class="ok"  *ngIf="ok">{{ ok }}</div>

      <button type="submit" [disabled]="busy()">Reserve</button>
    </form>

  `,
  styles:[`.ok{color:#0a7a0a}.err{color:#b00020}`]
})
export class BookingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private storeApi = inject(StoreService);
  private bookingApi = inject(BookingService);

  /** Route params */
  spotId = '';
  /** storeId can be supplied via query param by the search page */
  storeId: string | null = null;

  /** Form fields (native date inputs use 'YYYY-MM-DD') */
  start = '';
  end = '';

  /** Availability */
    // Add/replace these fields
  blockedSet = new Set<string>();              // for validation
  openWeekdaysSet: Set<number> | null = null;  // for validation

  blockedList: string[] = [];                  // for template display
  openWeekdaysList: number[] = [];

  /** UI state */
  busy = signal(false);
  err: string | null = null;
  ok: string | null = null;

  ngOnInit() {
    this.spotId = this.route.snapshot.paramMap.get('spotId') || '';
    this.storeId = this.route.snapshot.queryParamMap.get('storeId');

    // Initialize date fields with sensible defaults (today + tomorrow)
    this.start = this.todayISO();
    this.end   = this.addDaysISO(1);

    // Load availability if we have storeId
    if (this.storeId) {
      this.loadAvailability(this.storeId);
    } else {
      // If no storeId provided, you can optionally try to fetch the spot to obtain its storeId:
      // this.storeApi.getSpot(this.spotId).subscribe(spot => {
      //   this.storeId = spot.storeId;
      //   if (this.storeId) this.loadAvailability(this.storeId);
      // });
      // For now, we continue without availability if storeId is missing.
    }
  }

  // Update loadAvailability(...)
  loadAvailability(storeId: string) {
    const from = this.todayISO();
    const to   = this.addDaysISO(90);
    this.storeApi.getAvailability(storeId, from, to).subscribe({
      next: (a) => {
        // arrays for template
        this.blockedList = a.blackouts ?? [];
        this.openWeekdaysList = a.openWeekdays ?? [];

        // sets for validation
        this.blockedSet = new Set(this.blockedList);
        this.openWeekdaysSet = this.openWeekdaysList.length
          ? new Set(this.openWeekdaysList)
          : null; // null => open all days except blackouts
      },
      error: () => {
        this.openWeekdaysSet = null;
      }
    });
  }

  /** Validate selected range against availability */
  validRange(startISO: string, endISO: string): boolean {
    if (!startISO || !endISO) return false;
    const s = new Date(startISO);
    const e = new Date(endISO);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || s > e) return false;

    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
      const iso = d.toISOString().slice(0, 10);
      if (this.blockedSet.has(iso)) return false;
      if (this.openWeekdaysSet) {
        const dow = this.isoDayOfWeek(d); // 1..7
        if (!this.openWeekdaysSet.has(dow)) return false;
      }
    }
    return true;
  }

  /** Submit booking */
  submit() {
    this.err = null; this.ok = null;

    if (!this.spotId) {
      this.err = 'Missing spot id.';
      return;
    }
    if (!this.validRange(this.start, this.end)) {
      this.err = 'Store is closed for one or more of the selected dates.';
      return;
    }

    this.busy.set(true);
    this.bookingApi.create({ spotId: this.spotId, startDate: this.start, endDate: this.end })
      .subscribe({
        next: (b) => {
          this.busy.set(false);
          this.ok = 'Reserved!';
          // Navigate to confirmation/payment page
          this.router.navigate(['/booking/confirm', b.id]);
        },
        error: (e) => {
          this.busy.set(false);
          this.err = e?.error?.message || 'Could not reserve';
        }
      });
  }

  // ===== helpers =====

  /** Today as 'YYYY-MM-DD' */
  private todayISO(): string {
    const d = new Date(); d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  }

  /** Add N days and return 'YYYY-MM-DD' */
  private addDaysISO(n: number): string {
    const d = new Date(); d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  }

  /** Convert JS getDay() (0..6 Sun..Sat) → ISO 1..7 (Mon..Sun) */
  private isoDayOfWeek(d: Date): number {
    return ((d.getDay() + 6) % 7) + 1;
  }
}
