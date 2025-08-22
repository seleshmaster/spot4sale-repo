// src/app/features/owner/owner-dashboard.component.ts
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OwnerService, Store, Booking } from './owner.service';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'owner-dashboard',
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Owner Dashboard</h2>

    <div class="row">
      <div class="col">
        <h3>Your Stores</h3>
        <ul class="list">
          <li *ngFor="let s of stores()" [class.active]="s.id===selectedId()" (click)="select(s)">
            <div class="title">{{ s.name }}</div>
            <div class="muted">{{ s.city || '' }} {{ s.zipCode ? '• ' + s.zipCode : '' }}</div>
          </li>
        </ul>
      </div>

      <div class="col" *ngIf="selectedId()">
        <h3>Bookings</h3>
        <div *ngIf="bookings().length===0" class="muted">No bookings yet.</div>
        <table class="table" *ngIf="bookings().length">
          <thead>
            <tr><th>Dates</th><th>Status</th><th>Total</th><th>Actions</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let b of bookings()">
              <td>{{ b.startDate }} → {{ b.endDate }}</td>
              <td>
                <span class="badge"
                      [class.pending]="b.status==='PENDING'"
                      [class.paid]="b.status==='PAID'"
                      [class.confirmed]="b.status==='CONFIRMED'"
                      [class.cancelled]="b.status==='CANCELLED'"
                      [class.completed]="b.status==='COMPLETED'">
                  {{ b.status }}
                </span>
              </td>
              <td>{{ b.totalPrice ?? 0 | currency:'USD':'symbol':'1.0-0' }}</td>
              <td class="actions">
                <button (click)="setStatus(b,'CONFIRMED')" [disabled]="b.status==='CONFIRMED'">Confirm</button>
                <button (click)="setStatus(b,'CANCELLED')" [disabled]="b.status==='CANCELLED'">Cancel</button>
                <button (click)="setStatus(b,'COMPLETED')" [disabled]="b.status==='COMPLETED'">Complete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .row{display:flex;gap:20px}
    .col{flex:1}
    .list{list-style:none;padding:0;margin:0;display:grid;gap:8px}
    .list li{border:1px solid #eee;padding:10px;border-radius:8px;cursor:pointer}
    .list li.active{border-color:#999;background:#fafafa}
    .title{font-weight:600}
    .muted{opacity:.7;font-size:12px}
    .table{width:100%;border-collapse:collapse}
    .table th,.table td{border-bottom:1px solid #eee;padding:8px}
    .actions button{margin-right:6px}
    .badge{padding:2px 8px;border-radius:12px;font-size:12px;border:1px solid #eee}
    .badge.pending{background:#fff6e5}
    .badge.paid{background:#e9f8ef}
    .badge.confirmed{background:#e7f0ff}
    .badge.cancelled{background:#fdeaea}
    .badge.completed{background:#f2f2f2}
  `]
})
export class OwnerDashboardComponent {
  private api = inject(OwnerService);
  stores = signal<Store[]>([]);
  selectedId = signal<string>('');
  bookings = signal<Booking[]>([]);

  constructor(){
    this.api.myStores().subscribe(s => {
      this.stores.set(s);
      if (s.length) this.select(s[0]);
    });
  }

  select(s: Store){
    this.selectedId.set(s.id);
    this.api.bookings(s.id).subscribe(b => this.bookings.set(b));
  }

  setStatus(b: Booking, status: string){
    const storeId = this.selectedId();
    this.api.updateBookingStatus(storeId, b.id, status).subscribe(updated => {
      this.bookings.update(list => list.map(x => x.id === b.id ? updated : x));
    });
  }
}
