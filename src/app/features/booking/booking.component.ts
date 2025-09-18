// src/app/features/booking/booking.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import {  ViewEncapsulation } from '@angular/core';

import { BookingService } from './booking.service';
import { HostService } from '../hosts/host.service';


@Component({
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, FormsModule, NgbDatepickerModule],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private hostApi = inject(HostService);
  private bookingApi = inject(BookingService);

  /** Route params */
  boothId = '';
  /** Optional: provided by search page or resolved before calling loadAvailability */
  hostId: string | null = null;

  /** Form fields */
  start = '';
  end = '';

  /** Availability */
  calendarReady = false;
  minDate!: NgbDateStruct;
  maxDate!: NgbDateStruct;

  blockedSet = new Set<string>();              // for validation
  openWeekdaysSet: Set<number> | null = null;  // for validation (1..7 ISO)

  blockedList: string[] = [];                  // for template display
  openWeekdaysList: number[] = [];

  isDisabled = (date: NgbDateStruct): boolean => {
    const iso = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;

    // Blocked days
    if (this.blockedSet.has(iso)) return true;

    // Weekday rule (if defined)
    if (this.openWeekdaysSet) {
      const d = new Date(iso);
      const dow = ((d.getUTCDay() + 6) % 7) + 1; // convert JS day → ISO
      if (!this.openWeekdaysSet.has(dow)) return true;
    }

    return false;
  };

  /** UI state */
  busy = signal(false);
  err: string | null = null;
  ok: string | null = null;

  private selectingStart = true;

  ngOnInit() {
    this.boothId = this.route.snapshot.paramMap.get('spotId') || '';
    this.hostId = this.route.snapshot.queryParamMap.get('storeId');

    // defaults: today / tomorrow
    this.start = todayISO();
    this.end   = addDaysISO(this.start, 1);

    // If you didn’t pass storeId via query param, you can fetch spot->storeId here (optional).
    // Keeping as-is per your preference.

    if (this.hostId) {
      this.loadAvailability(this.hostId);
    } else {
      // No storeId means calendar can’t be bounded/disabled correctly.
      this.calendarReady = false;
    }
  }

  /** Load availability for a window (today..+12 months) */
  loadAvailability(storeId: string) {
    const from = firstOfThisMonthISO();
    const to   = addMonthsISO(from, 12); // wide window for navigation

    this.hostApi.getCalendar(storeId, from, to).subscribe({
      next: (cal) => {
        // blackout days
        this.blockedList = cal.blackouts ?? [];
        this.blockedSet = new Set(this.blockedList);

        // weekly whitelist (if provided by API we surfaced)
        this.openWeekdaysList = (cal as any).openWeekdays ?? [];
        this.openWeekdaysSet = this.openWeekdaysList.length ? new Set(this.openWeekdaysList) : null;

        // seasons: bound the calendar from min(start) to max(end)
        const seasonStarts = (cal.seasons ?? []).map(s => s.startDate);
        const seasonEnds   = (cal.seasons ?? []).map(s => s.endDate);
        if (seasonStarts.length && seasonEnds.length) {
          const minISO = seasonStarts.reduce((a,b) => a < b ? a : b);
          const maxISO = seasonEnds.reduce((a,b) => a > b ? a : b);
          this.minDate = isoToStruct(minISO)!;
          this.maxDate = isoToStruct(maxISO)!;
        } else {
          // No seasons => keep to current month only
          const t = new Date();
          const y = t.getFullYear(), m = t.getMonth() + 1;
          this.minDate = { year: y, month: m, day: 1 };
          this.maxDate = { year: y, month: m, day: daysInMonth(y, m) };
        }

        this.calendarReady = true;
      },
      error: () => {
        // fall back to current month without disabling
        const t = new Date();
        const y = t.getFullYear(), m = t.getMonth() + 1;
        this.minDate = { year: y, month: m, day: 1 };
        this.maxDate = { year: y, month: m, day: daysInMonth(y, m) };
        this.openWeekdaysSet = null;
        this.calendarReady = true;
      }
    });
  }

  /** ng-bootstrap: disable a cell when true */
  markDisabled = (date: NgbDateStruct): boolean => {
    const iso = structToISO(date);

    // outside hard bounds: datepicker already prevents nav; keep false here
    // explicit blackouts always disabled
    if (this.blockedSet.has(iso)) return true;

    // If seasons are returned, allow any date within any season,
    // and apply weekday whitelist if provided (openWeekdaysSet not null).
    // We don’t have individual seasons here; we rely on API’s min/max + openWeekdays.
    if (this.openWeekdaysSet) {
      const dow = isoDayOfWeek(iso);
      if (!this.openWeekdaysSet.has(dow)) return true;
    }

    return false;
  };

  /** When user picks a date on the calendar */
  onCalendarSelect(date: NgbDateStruct) {
    const startISO = structToISO(date);
    const endISO   = addDaysISO(startISO, 1);
    this.start = startISO;
    this.end   = endISO;
    this.err = null;
    this.ok = null;
  }

  /** Validate the range against current rules */
  private validRange(startISO: string, endISO: string): boolean {
    if (!startISO || !endISO) return false;
    const s = new Date(startISO + 'T00:00:00Z');
    const e = new Date(endISO   + 'T00:00:00Z');
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || s >= e) return false;

    for (let d = new Date(s); d < e; d.setUTCDate(d.getUTCDate() + 1)) {
      const iso = toISO(d);
      if (this.blockedSet.has(iso)) return false;
      if (this.openWeekdaysSet) {
        const dow = jsToIsoDow(d.getUTCDay()); // 1..7
        if (!this.openWeekdaysSet.has(dow)) return false;
      }
    }
    return true;
  }

  /** Submit booking (unchanged from your flow) */
  submit() {
    this.err = null; this.ok = null;

    if (!this.boothId) { this.err = 'Missing spot id.'; return; }
    if (!this.validRange(this.start, this.end)) {
      this.err = 'Store is closed for one or more of the selected dates.'; return;
    }

    this.busy.set(true);
    this.bookingApi.create({ spotId: this.boothId, startDate: this.start, endDate: this.end })
      .subscribe({
        next: (b) => {
          this.busy.set(false);
          this.ok = 'Reserved!';
          this.router.navigate(['/booking/confirm', b.id]);
        },
        error: (e) => {
          this.busy.set(false);
          this.err = e?.error?.message || 'Could not reserve';
        }
      });
  }

  onDateSelect(date: NgbDateStruct) {
    const iso = this.structToISO(date);

    if (this.selectingStart) {
      // First click = start date
      this.start = iso;
      this.end = ''; // reset end
      this.selectingStart = false;
    } else {
      // Second click = end date
      const startDate = new Date(this.start);
      const endDate = new Date(iso);

      // ensure valid range & max 2 days
      const diff = (endDate.getTime() - startDate.getTime()) / (1000*60*60*24);
      if (endDate >= startDate && diff <= 2) {
        this.end = iso;
      } else {
        this.err = "End date must be after start date and within 2 days.";
      }
      this.selectingStart = true; // reset for next selection
    }
  }

  private structToISO(s: NgbDateStruct): string {
    const pad = (n: number) => n < 10 ? '0'+n : ''+n;
    return `${s.year}-${pad(s.month)}-${pad(s.day)}`;
  }

  cancel() {
    this.router.navigate(['search']);
  }
}

/* ---------------- helpers ---------------- */

function pad(n: number) { return n < 10 ? `0${n}` : `${n}`; }
function toISO(d: Date): string { return `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}`; }
function structToISO(s: NgbDateStruct): string { return `${s.year}-${pad(s.month)}-${pad(s.day)}`; }
function isoToStruct(iso: string): NgbDateStruct | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? { year: +m[1], month: +m[2], day: +m[3] } : null;
}
function daysInMonth(year: number, month1: number): number { return new Date(year, month1, 0).getDate(); }
function todayISO(): string { return toISO(new Date()); }
function firstOfThisMonthISO(): string {
  const t = new Date(); const d = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), 1));
  return toISO(d);
}
function addMonthsISO(fromISO: string, months: number): string {
  const [y,m] = fromISO.split('-').map(Number); // YYYY-MM-..
  const d = new Date(Date.UTC(y, m-1, 1)); d.setUTCMonth(d.getUTCMonth()+months);
  return toISO(d);
}
function addDaysISO(fromISO: string, days: number): string {
  const d = new Date(fromISO + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate()+days);
  return toISO(d);
}
function isoDayOfWeek(iso: string): number {
  const d = new Date(iso + 'T00:00:00Z'); return jsToIsoDow(d.getUTCDay());
}
function jsToIsoDow(js: number): number { return js === 0 ? 7 : js; } // JS 0..6 => ISO 1..7
