import {Component, inject, OnInit, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HostService } from './host.service';
import { Router, ActivatedRoute } from '@angular/router';
import {Host, HostFormModel} from './models/host.models';
import {Amenity, HostCategory, HostType} from './host-meta.service';



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

  model: HostFormModel = {
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
  hostId!: string;

  hostTypes: HostType[] = [];
  hostCategories: HostCategory[] = [];
  amenities: Amenity[] = [];

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

      this.hostId = id;
      console.log('HostEditComponent storeId:', this.hostId);
      this.loadStore();
    });
  }

  loadStore() {
    this.busy.set(true);
    this.storeService.getHost(this.hostId).subscribe({
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

  submitUpdate(f: NgForm) {
    if (f.invalid || this.busy()) return;
    this.error.set(null);
    this.busy.set(true);

    // Prepare payload for update (same as create)
    const payload: any = {
      name: this.model.name,
      address: this.model.address,
      city: this.model.city,
      zipCode: this.model.zipCode,
      description: this.model.description || '',
      latitude: this.model.latitude ?? 0,
      longitude: this.model.longitude ?? 0,
      defaultPrice: this.model.defaultPrice ?? 0,
      maxBooths: this.model.maxBooths ?? 1,
      contactEmail: this.model.contactEmail || '',
      contactPhone: this.model.contactPhone || '',
      cancellationPolicy: this.model.cancellationPolicy || '',
      bookingWindowDays: this.model.bookingWindowDays ?? 30,
      active: this.model.active ?? true,
      hostTypeName: this.model.hostTypeName || '',
      hostCategoryName: this.model.hostCategoryName || '',
      tags: this.model.tags || [],
      operatingHours: this.model.operatingHours || {},
      amenityIds: this.model.amenityIds || [],
      images: this.previewImages || [],
      thumbnail: this.model.thumbnail || '',
      characteristics: this.model.characteristics || {},
      defaultAmenities: this.model.defaultAmenities || [],
      footTrafficEstimate: this.model.footTrafficEstimate ?? 0
    };

    console.log('Submitting host update payload:', payload);

    // Call update API
    this.storeService.updateStore(this.hostId, payload).subscribe({
      next: (s) => {
        this.busy.set(false);
        // Optionally navigate or show success message
        this.router.navigate(['/hosts', s.id, 'booths', 'manage']);
      },
      error: (e) => {
        this.busy.set(false);
        const msg = e?.error?.message || e?.message || 'Failed to update host';
        this.error.set(msg);
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
