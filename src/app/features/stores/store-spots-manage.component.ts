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
  templateUrl: 'store-spots-manage.component.html',
  styleUrls: ['store-spots-manage.component.scss']
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

  updatePrice(s: Spot, newVal: string | number) {
    const price = typeof newVal === 'string' ? Number.parseFloat(newVal) : newVal;
    if (!Number.isFinite(price) || price < 0.5) return;

    this.api.updateSpot(s.id, { pricePerDay: price }).subscribe(updated => {
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
