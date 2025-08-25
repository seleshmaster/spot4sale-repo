// src/app/features/booking/booking-datepicker.component.ts
import {Component, inject, OnInit, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgbDate, NgbDatepickerModule, NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

// Types the booking page already uses
export interface Spot { id: string; storeId: string; }
export interface SeasonDTO { startDate: string; endDate: string; openWeekdays: number[]; note?: string; }
export interface CalendarDTO { blackoutDays: string[]; openWeekdays: number[]; seasons: SeasonDTO[]; }

@Component({
  standalone: true,
  selector: 'booking-datepicker',
  imports: [CommonModule, NgbDatepickerModule],
  template: `
    <div class="card">
      <div class="card-body">
        <ng-container *ngIf="ready(); else loading">
          <ngb-datepicker
            #dp="ngbDatepicker"
            [displayMonths]="1"
            [navigation]="'arrows'"
            [outsideDays]="'collapsed'"
            [minDate]="minDate"
            [maxDate]="maxDate"
            [markDisabled]="isDisabled"
            (select)="onSelect($any($event))">
          </ngb-datepicker>
        </ng-container>
        <ng-template #loading>
          <div class="text-muted">Loading calendar…</div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`.card{max-width:380px}`]
})
export class BookingDatePickerComponent implements  OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private router = inject(Router);


  // inputs resolved at runtime
  spotId!: string;
  storeId!: string;

  // date bounds for navigation
  minDate!: NgbDateStruct;
  maxDate!: NgbDateStruct;

  // availability
  ready = signal(false);
  blackoutSet = new Set<string>(); // 'YYYY-MM-DD'
  seasons: { start: string; end: string; openWeekdays: number[] }[] = [];

  async ngOnInit() {
    // 1) Resolve spotId → storeId
    this.spotId = this.route.snapshot.paramMap.get('spotId')!;
    const spot = await this.http.get<Spot>(`${environment.apiBase}/spots/${this.spotId}`).toPromise();
    if (!spot) {
      console.warn('No spot');
      return;
    }
    this.storeId = spot.storeId;

    // 2) Ask availability for a BIG window (ensures arrows and future months show)
    const today = new Date();
    const firstOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstOfNextYear = new Date(today.getFullYear() + 1, today.getMonth(), 1);

    const fromISO = toISO(firstOfThisMonth);
    const toISOEnd = toISO(firstOfNextYear); // name it clearly

    const cal = await this.http.get<CalendarDTO>(
      `${environment.apiBase}/stores/${this.storeId}/availability`,
      {params: {from: fromISO, to: toISOEnd}}
    ).toPromise();

    if (!cal) {
      console.warn('No calendar');
      return;
    }

    // 3) Process seasons & blackouts
    this.seasons = (cal.seasons || []).map(s => ({
      start: s.startDate, end: s.endDate, openWeekdays: s.openWeekdays || []
    }));
    (cal.blackoutDays || []).forEach(d => this.blackoutSet.add(d));

    // 4) Boundaries: if seasons exist, use min(start) … max(end); else open a year
    if (this.seasons.length) {
      const min = this.seasons.map(s => s.start).reduce((a, b) => a < b ? a : b);
      const max = this.seasons.map(s => s.end).reduce((a, b) => a > b ? a : b);
      this.minDate = isoToStruct(min)!;
      this.maxDate = isoToStruct(max)!;
    } else {
      // show a full year so arrows appear and selection works
      this.minDate = {year: firstOfThisMonth.getFullYear(), month: firstOfThisMonth.getMonth() + 1, day: 1};
      this.maxDate = {
        year: firstOfNextYear.getFullYear(),
        month: firstOfNextYear.getMonth() + 1,
        day: daysInMonth(firstOfNextYear.getFullYear(), firstOfNextYear.getMonth() + 1)
      };
    }

    this.ready.set(true);
  }


  // Disable rule: return true to disable
  isDisabled = (date: NgbDateStruct) => {
    const iso = structToISO(date); // YYYY-MM-DD
    if (this.blackoutSet.has(iso)) return true;

    // If no seasons defined, allow everything in [minDate, maxDate]
    if (!this.seasons.length) return false;

    const dow = isoDayOfWeek(iso); // 1..7 (Mon..Sun)
    // covered by any season where iso in [start,end] and weekday allowed (or no weekday restriction)
    const covered = this.seasons.some(s => {
      if (iso < s.start || iso > s.end) return false;
      return !s.openWeekdays?.length || s.openWeekdays.includes(dow);
    });

    return !covered;
  };

  onSelect(date: NgbDate | NgbDateStruct) {
    console.log('Selected:', date); // should print when you click a day
    const s: NgbDateStruct = 'year' in date
      ? { year: date.year, month: date.month, day: date.day }
      : date;

    const startISO = structToISO(s);
    const endISO = plusDaysISO(startISO, 1);

    this.router.navigate(['/book', this.spotId], {
      queryParams: { start: startISO, end: endISO }
    });
  }
}

/* --------- helpers --------- */

function pad(n: number) { return n < 10 ? `0${n}` : `${n}`; }
function toISO(d: Date): string { return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function structToISO(s: NgbDateStruct): string { return `${s.year}-${pad(s.month)}-${pad(s.day)}`; }
function isoToStruct(iso: string): NgbDateStruct | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  return { year: +m[1], month: +m[2], day: +m[3] };
}
function isoDayOfWeek(iso: string): number {
  // returns 1..7 ISO (Mon..Sun)
  const d = new Date(iso + 'T00:00:00Z');
  const js = d.getUTCDay(); // 0..6 (Sun..Sat)
  return js === 0 ? 7 : js;
}
function plusDaysISO(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return toISO(d);
}
function daysInMonth(year: number, month1: number): number {
  return new Date(year, month1, 0).getDate();
}

