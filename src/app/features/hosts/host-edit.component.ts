import {Component, inject, OnInit, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HostService } from './host.service';
import { Router, ActivatedRoute } from '@angular/router';
import {Host, HostModel} from './models/host.models';



@Component({
  selector: 'app-store-update',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './host-edit.component.html',
  styleUrls: ['./host-edit.component.scss']
})
export class HostEditComponent implements  OnInit {

  private storeService = inject(HostService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  busy = signal(false);
  error = signal<string | null>(null);

  model: HostModel = {
    name: '',
    address: '',
    city: '',
    zipCode: '',
    latitude: 0,
    longitude: 0,
    description: '',
    images: []
  };

  previewImages: string[] = [];
  storeId!: string;

  constructor() {
    // this.storeId = this.route.snapshot.paramMap.get('id')!;
    // this.loadStore();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('storeId');
      if (!id || id === 'null') {
        console.error('Invalid store ID, redirecting');
        this.router.navigate(['/stores/create']);
        return;
      }

      this.storeId = id;
      console.log('HostEditComponent storeId:', this.storeId);
      this.loadStore();
    });
  }

  loadStore() {
    this.busy.set(true);
    this.storeService.getHost(this.storeId).subscribe({
      next: (s: Host) => {
        this.model = {
          name: s.name,
          address: s.address || '',
          city: s.city || '',
          zipCode: s.zipCode || '',
          latitude: s.latitude,
          longitude: s.longitude,
          description: s.description,
          images: []  // Images are separate, we’ll show existing ones in previewImages
        };
        this.previewImages = s.images || [];
        this.busy.set(false);
      },
      error: (e) => {
        this.busy.set(false);
        this.error.set('Failed to load store');
      }
    });
  }

  submit(f: NgForm) {
    if (f.invalid || this.busy()) return;
    this.error.set(null);
    this.busy.set(true);

    const payload = {
      ...this.model,
      images: this.previewImages
    };

    this.storeService.updateStore(this.storeId, payload).subscribe({
      next: () => {
        this.busy.set(false);
        this.router.navigate(['owner']);
      },
      error: (e) => {
        this.busy.set(false);
        this.error.set(e?.error?.message || 'Failed to update store');
      }
    });
  }

  cancel() {
    this.router.navigate(['owner']);
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
