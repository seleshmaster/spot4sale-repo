import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ActivatedRoute, RouterLink} from '@angular/router';
import { StoreService } from '../stores/store.service';
import {SeasonDTO} from '../stores/season.models';

@Component({
  standalone: true,
  selector: 'owner-availability',
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Store Availability</h2>

    <div class="muted">Manage open seasons for this store. Dates outside seasons (or on blackouts) can’t be booked.</div>

    <form class="season-form" (ngSubmit)="add()">
      <label>Start</label>
      <input type="date" [(ngModel)]="start" name="start" required>

      <label>End</label>
      <input type="date" [(ngModel)]="end" name="end" required>

      <label>Open weekdays (1=Mon…7=Sun, comma-separated)</label>
      <input type="text" [(ngModel)]="weekdayStr" name="weekdayStr" placeholder="e.g. 5,6,7">

      <label>Note</label>
      <input type="text" [(ngModel)]="note" name="note" placeholder="Summer season">

      <button type="submit" [disabled]="busy()">Add</button>
      <span class="err" *ngIf="err">{{ err }}</span>
    </form>

    <ul class="list">
      <li *ngFor="let s of seasons()">
        <div>
          <b>{{ s.startDate }}</b> → <b>{{ s.endDate }}</b>
          <span *ngIf="s.openWeekdays?.length"> • days: {{ s.openWeekdays!.join(',') }}</span>
          <span *ngIf="s.note"> • {{ s.note }}</span>
        </div>
        <button (click)="remove(s)" [disabled]="busy()">Delete</button>
      </li>
    </ul>

    <div *ngIf="seasons().length===0" class="muted">No seasons yet.</div>
  `,
  styles: [`
    .season-form{display:grid;grid-template-columns:160px 1fr;gap:8px;max-width:600px;margin:12px 0}
    .list{list-style:none;padding:0;margin:16px 0;display:grid;gap:8px}
    .list li{display:flex;justify-content:space-between;align-items:center;border:1px solid #eee;border-radius:8px;padding:10px}
    .muted{opacity:.75}
    .err{color:#b00020;margin-left:10px}
  `]
})
export class OwnerAvailabilityComponent {
  private route = inject(ActivatedRoute);
  private api = inject(StoreService);

  storeId = this.route.snapshot.queryParamMap.get('storeId') || ''; // pass storeId=? in the link
  seasons = signal<SeasonDTO[]>([]);
  start = ''; end = ''; weekdayStr = ''; note = '';
  err: string | null = null;
  busy = signal(false);

  ngOnInit() { this.load(); }

  load() {
    if (!this.storeId) return;
    this.busy.set(true);
    this.api.listSeasons(this.storeId).subscribe({
      next: s => { this.seasons.set(s); this.busy.set(false); },
      error: () => { this.busy.set(false); }
    });
  }

  add() {
    this.err = null;
    if (!this.start || !this.end) { this.err = 'Pick start/end'; return; }

    const openWeekdays = this.weekdayStr.trim()
      ? this.weekdayStr.split(',').map(s => parseInt(s.trim(),10)).filter(n => n>=1 && n<=7)
      : undefined;

    this.busy.set(true);
    this.api.createSeason(this.storeId, { startDate: this.start, endDate: this.end, openWeekdays, note: this.note })
      .subscribe({
        next: s => { this.seasons.set([...this.seasons(), s]); this.busy.set(false);
          this.start=''; this.end=''; this.weekdayStr=''; this.note='';
        },
        error: e => { this.err = e?.error?.message || 'Failed'; this.busy.set(false); }
      });
  }

  remove(s: SeasonDTO) {
    if (!confirm('Delete this season?')) return;
    this.busy.set(true);
    this.api.deleteSeason(this.storeId, s.id).subscribe({
      next: () => { this.seasons.set(this.seasons().filter(x => x.id !== s.id)); this.busy.set(false); },
      error: () => { this.busy.set(false); }
    });
  }
}
