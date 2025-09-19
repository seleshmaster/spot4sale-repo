import {Component, inject, OnInit, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, NgForm} from '@angular/forms';
import {Booth, Host, HostFormModel} from './models/host.models';
import {Router} from '@angular/router';
import {HostService} from './host.service';
import {Amenity, HostCategory, HostMetaService, HostType} from './host-meta.service';



@Component({
  selector: 'app-store-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './host-create.component.html',
  styleUrls: ['./host-create.component.scss']
})
export class HostCreateComponent implements OnInit {

  private store = inject(HostService);
  private router = inject(Router);
  private hostMetaService = inject(HostMetaService);

  city = '';
  zip = '';
  stores: Host[] = [];
  spots: Record<string, Booth[]> = {};

  model: HostFormModel = {
    name: '',
    address: '',
    city: '',
    zipCode: '',
    description: '',
    latitude: 0,
    longitude: 0,
    images: [],           // array of File objects
    thumbnail: undefined, // optional
    characteristics: {},  // empty JSON object
    defaultPrice: undefined,
    defaultAmenities: [],
    maxBooths: undefined,
    operatingHours: {},   // empty JSON object
    contactEmail: '',
    contactPhone: '',
    tags: '',
    footTrafficEstimate: undefined,
    cancellationPolicy: '',
    bookingWindowDays: undefined,
    active: true,         // default to true
    hostTypeName: '',
    hostCategoryName: '',
    amenityIds: []
  };


  busy = signal(false);
  error = signal<string | null>(null);
  previewImages: string[] = [];
  hostTypes: HostType[] = [];
  hostCategories: HostCategory[] = [];
  amenities: Amenity[] = [];

  ngOnInit(): void {
    this.hostMetaService.getHostTypes().subscribe(types => this.hostTypes = types);
    this.hostMetaService.getHostCategories().subscribe(cats => this.hostCategories = cats);
    this.hostMetaService.getAmenities().subscribe(amns => this.amenities = amns);

    this.model.amenityIds = this.model.amenityIds || [];
  }

  submit(f: NgForm) {
    if (f.invalid || this.busy()) return;
    this.error.set(null);
    this.busy.set(true);

    // Prepare JSON payload
    const payload: any =  {
      name: this.model.name,
      address: this.model.address,
      city: this.model.city,
      zipCode: this.model.zipCode,
      description: this.model.description || '',
      latitude: this.model.latitude ?? 0,
      longitude: this.model.longitude ?? 0,
      defaultPrice: this.model.defaultPrice,
      maxBooths: this.model.maxBooths,
      contactEmail: this.model.contactEmail || '',
      contactPhone: this.model.contactPhone || '',
      cancellationPolicy: this.model.cancellationPolicy || '',
      bookingWindowDays: this.model.bookingWindowDays,
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
      footTrafficEstimate: this.model.footTrafficEstimate
    };

    // Submit JSON payload
    this.store.create(payload).subscribe({
      next: (s) => {
        this.busy.set(false);
        // Redirect to manage booths for the newly created host
        this.router.navigate(['/hosts', s.id, 'booths', 'manage']);
      },
      error: (e) => {
        this.busy.set(false);
        const msg = e?.error?.message || e?.message || 'Failed to create host';
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

  isSelected(id: string): boolean {
    return (this.model.amenityIds ?? []).includes(id);
  }

  toggleAmenity(event: Event, id: string) {
    const checked = (event.target as HTMLInputElement).checked;

    // Ensure amenityIds is never undefined
    this.model.amenityIds = this.model.amenityIds ?? [];

    if (checked) {
      if (!this.model.amenityIds.includes(id)) this.model.amenityIds.push(id);
    } else {
      this.model.amenityIds = this.model.amenityIds.filter(a => a !== id);
    }
  }

  allSelected(): boolean {
    return (this.model.amenityIds ?? []).length === this.amenities.length;
  }

  toggleSelectAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.model.amenityIds = this.amenities.map(a => a.id);
    } else {
      this.model.amenityIds = [];
    }
  }
}
