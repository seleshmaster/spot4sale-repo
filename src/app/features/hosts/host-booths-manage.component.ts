import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HostService } from './host.service';
import {Booth} from './models/host.models';

@Component({
  standalone: true,
  selector: 'store-spots-manage',
  imports: [CommonModule, FormsModule],
  templateUrl: 'host-booths-manage.component.html',
  styleUrls: ['host-booths-manage.component.scss']
})
export class HostBoothsManageComponent {
  private ar = inject(ActivatedRoute);
  private api = inject(HostService);

  storeId = this.ar.snapshot.paramMap.get('storeId')!;
  spots = signal<Booth[]>([]);
  price = 10;
  available = true;
  busy = signal(false);
  err = signal<string|null>(null);

  ngOnInit(){ this.reload(); }

  reload(){
    this.api.booths(this.storeId).subscribe(s => this.spots.set(s));
  }

  add(f: NgForm){
    if (f.invalid || this.busy()) return;
    this.busy.set(true); this.err.set(null);
    this.api.createBooth({ storeId: this.storeId, pricePerDay: this.price, available: this.available })
      .subscribe({
        next: s => { this.busy.set(false); this.spots.update(list => [s, ...list]); f.resetForm({ pricePerDay: 10, available: true }); },
        error: e => { this.busy.set(false); this.err.set(e?.error?.message || e.message || 'Failed to add spot'); }
      });
  }

  updatePrice(s: Booth, newVal: string | number) {
    const price = typeof newVal === 'string' ? Number.parseFloat(newVal) : newVal;
    if (!Number.isFinite(price) || price < 0.5) return;

    this.api.updateBooth(s.id, { pricePerDay: price }).subscribe(updated => {
      this.spots.update(list => list.map(x => x.id === s.id ? updated : x));
    });
  }

  toggle(s: Booth){
    this.api.updateBooth(s.id, { available: !s.available }).subscribe(updated => {
      this.spots.update(list => list.map(x => x.id === s.id ? updated : x));
    });
  }

  remove(s: Booth){
    if (!confirm('Delete this spot?')) return;
    this.api.deleteBooth(s.id).subscribe(() => {
      this.spots.update(list => list.filter(x => x.id !== s.id));
    });
  }
}
