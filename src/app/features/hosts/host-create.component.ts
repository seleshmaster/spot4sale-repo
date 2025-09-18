import {Component, inject, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, NgForm} from '@angular/forms';
import {Booth, Host, HostModel} from './models/host.models';
import {Router} from '@angular/router';
import {HostService} from './host.service';



@Component({
  selector: 'app-store-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './host-create.component.html',
  styleUrls: ['./host-create.component.scss']
})
export class HostCreateComponent {

  private store = inject(HostService);
  private router = inject(Router);

  city = '';
  zip = '';
  stores: Host[] = [];
  spots: Record<string, Booth[]> = {};

  model: HostModel = {
    name: '',
    address: '',
    city: '',
    zipCode: '',
    description: '',
    latitude: 0,
    longitude: 0,
    images: []
  };

  busy = signal(false);
  error = signal<string | null>(null);
  previewImages: string[] = [];

  submit(f: NgForm) {
    if (f.invalid || this.busy()) return;
    this.error.set(null);
    this.busy.set(true);

    const storePayload = {
      ...this.model,
      images: this.previewImages  // directly pass previewImages array
    };

    this.store.create(storePayload).subscribe({
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

  onFilesSelected(event: any) {
    const files: FileList = event.target.files;

    if (files.length + (this.model.images?.length || 0) > 3) {
      this.error.set('You can only upload up to 3 images.');
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      this.model.images!.push(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          this.previewImages.push(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }

    event.target.value = ''; // reset input
  }

  removeImage(index: number) {
    this.model.images!.splice(index, 1);
    this.previewImages.splice(index, 1);
  }
}
