import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ActivatedRoute, RouterLink} from '@angular/router';
import { StoreService } from '../stores/store.service';
import {SeasonDTO} from '../stores/models/season.models';

@Component({
  standalone: true,
  selector: 'owner-availability',
  imports: [CommonModule, FormsModule],
  templateUrl: 'owner-availability.component.html',
  styleUrls: ['owner-availability.component.scss']
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
