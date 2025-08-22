import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { StoreService } from './store.service';

@Component({
  standalone: true,
  selector: 'store-create',
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Create a Store</h2>
    <form #f="ngForm" (ngSubmit)="submit(f)" class="form">
      <label>
        <span>Name</span>
        <input type="text" name="name" [(ngModel)]="model.name" required/>
      </label>

      <label>
        <span>Address</span>
        <input type="text" name="address" [(ngModel)]="model.address" required/>
      </label>

      <div class="row">
        <label>
          <span>City</span>
          <input type="text" name="city" [(ngModel)]="model.city" required/>
        </label>
        <label>
          <span>ZIP</span>
          <input type="text" name="zipCode" [(ngModel)]="model.zipCode" required/>
        </label>
      </div>

      <div class="row">
        <label>
          <span>Latitude</span>
          <input type="number" name="latitude" [(ngModel)]="model.latitude" step="0.000001" required/>
        </label>
        <label>
          <span>Longitude</span>
          <input type="number" name="longitude" [(ngModel)]="model.longitude" step="0.000001" required/>
        </label>
      </div>

      <div class="actions">
        <button type="submit" [disabled]="f.invalid || busy()">Create</button>
        <span *ngIf="error()" class="error">{{ error() }}</span>
      </div>
    </form>
  `,
  styles: [`
    .form{display:grid;gap:12px;max-width:560px}
    .row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    label{display:grid;gap:6px}
    input{padding:8px;border:1px solid #ddd;border-radius:6px}
    .actions{display:flex;align-items:center;gap:12px}
    .error{color:#b00020}
  `]
})
export class StoreCreateComponent {
  private store = inject(StoreService);
  private router = inject(Router);

  model = {
    name: '',
    address: '',
    city: '',
    zipCode: '',
    latitude: 0,
    longitude: 0
  };

  busy = signal(false);
  error = signal<string | null>(null);

  submit(f: NgForm) {
    if (f.invalid || this.busy()) return;
    this.error.set(null);
    this.busy.set(true);

    this.store.create(this.model).subscribe({
      next: (s) => {
        this.busy.set(false);
        // Redirect directly to Manage Spots for the newly created store
        this.router.navigate(['/stores', s.id, 'spots', 'manage']);
      },
      error: (e) => {
        this.busy.set(false);
        const msg = e?.error?.message || e?.message || 'Failed to create store';
        this.error.set(msg);
      }
    });
  }
}
