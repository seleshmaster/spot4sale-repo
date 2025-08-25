import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { StoreService } from './store.service';

@Component({
  standalone: true,
  selector: 'store-create',
  imports: [CommonModule, FormsModule],
  templateUrl: 'store-create.component.html',
  styleUrls: ['store-create.component.scss']
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
