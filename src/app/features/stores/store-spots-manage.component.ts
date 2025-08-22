import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { StoreService } from './store.service';
import {Spot} from './store.models';

@Component({
  standalone: true,
  selector: 'store-spots-manage',
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Manage Spots</h2>

    <form #f="ngForm" (ngSubmit)="add(f)" class="row">
      <label>
        <span>Price/day (USD)</span>
        <input type="number" step="0.01" name="pricePerDay" [(ngModel)]="price" required min="0.5">
      </label>
      <label>
        <span>Available</span>
        <select name="available" [(ngModel)]="available">
          <option [ngValue]="true">Yes</option>
          <option [ngValue]="false">No</option>
        </select>
      </label>
      <button type="submit" [disabled]="f.invalid || busy()">Add Spot</button>
      <span class="error" *ngIf="err()">{{ err() }}</span>
    </form>

    <ul class="list">
      <li *ngFor="let s of spots()">
        <span class="price">\${{ s.pricePerDay }}/day</span>
        <span class="tag" [class.off]="!s.available">{{ s.available ? 'Available' : 'Unavailable' }}</span>

        <div class="actions">
          <!-- inline edit price -->
          <input type="number" step="0.01" [value]="s.pricePerDay" (change)="updatePrice(s, $event.target.value)">
          <button type="button" (click)="toggle(s)">{{ s.available ? 'Disable' : 'Enable' }}</button>
          <button type="button" class="danger" (click)="remove(s)">Delete</button>
        </div>
      </li>
    </ul>
  `,
  styles: [`
    .row{display:flex;gap:12px;align-items:end;margin-bottom:16px;flex-wrap:wrap}
    .row label{display:grid;gap:6px}
    input,select{padding:8px;border:1px solid #ddd;border-radius:6px}
    .list{list-style:none;padding:0;margin:0;display:grid;gap:8px}
    .list li{display:flex;justify-content:space-between;align-items:center;border:1px solid #eee;border-radius:8px;padding:10px}
    .price{font-weight:600}
    .tag{font-size:12px;border:1px solid #ddd;padding:2px 8px;border-radius:12px}
    .tag.off{background:#fee; color:#a00; border-color:#fbb}
    .actions{display:flex;gap:8px;align-items:center}
    .danger{color:#b00020}
    .error{color:#b00020}
  `]
})
export class StoreSpotsManageComponent {
  private ar = inject(ActivatedRoute);
  private api = inject(StoreService);

  storeId = this.ar.snapshot.paramMap.get('storeId')!;
  spots = signal<Spot[]>([]);
  price = 10;
  available = true;
  busy = signal(false);
  err = signal<string|null>(null);

  ngOnInit(){ this.reload(); }

  reload(){
    this.api.spots(this.storeId).subscribe(s => this.spots.set(s));
  }

  add(f: NgForm){
    if (f.invalid || this.busy()) return;
    this.busy.set(true); this.err.set(null);
    this.api.createSpot({ storeId: this.storeId, pricePerDay: this.price, available: this.available })
      .subscribe({
        next: s => { this.busy.set(false); this.spots.update(list => [s, ...list]); f.resetForm({ pricePerDay: 10, available: true }); },
        error: e => { this.busy.set(false); this.err.set(e?.error?.message || e.message || 'Failed to add spot'); }
      });
  }

  updatePrice(s: Spot, newVal: string | number){
    const price = typeof newVal === 'string' ? parseFloat(newVal) : newVal;
    if (isNaN(price as number) || (price as number) < 0.5) return;
    this.api.updateSpot(s.id, { pricePerDay: price as number }).subscribe(updated => {
      this.spots.update(list => list.map(x => x.id === s.id ? updated : x));
    });
  }

  toggle(s: Spot){
    this.api.updateSpot(s.id, { available: !s.available }).subscribe(updated => {
      this.spots.update(list => list.map(x => x.id === s.id ? updated : x));
    });
  }

  remove(s: Spot){
    if (!confirm('Delete this spot?')) return;
    this.api.deleteSpot(s.id).subscribe(() => {
      this.spots.update(list => list.filter(x => x.id !== s.id));
    });
  }
}
