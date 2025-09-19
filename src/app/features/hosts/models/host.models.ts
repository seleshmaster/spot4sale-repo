// Complete host object from backend
export interface Host {
  id: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
  thumbnail?: string;
  characteristics?: Record<string, any>; // JSON object
  defaultPrice?: number;
  defaultAmenities?: string[];
  maxBooths?: number;
  operatingHours?: Record<string, any>;
  contactEmail?: string;
  contactPhone?: string;
  tags?: string[];
  footTrafficEstimate?: number;
  cancellationPolicy?: string;
  bookingWindowDays?: number;
  active?: boolean;

  hostType?: { id: string; name: string };
  hostCategory?: { id: string; name: string };

  // Review info
  averageRating?: number;
  reviewCount?: number;
  showReviews?: boolean;  // toggle UI
}

// Model used for form submission (create/update)
export interface HostFormModel {
  name: string;
  address: string;
  city: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  images?: File[];        // local files to upload
  thumbnail?: File;       // optional thumbnail
  characteristics?: Record<string, any>;
  defaultPrice?: number;
  defaultAmenities?: string[];
  maxBooths?: number;
  operatingHours?: Record<string, any>;
  contactEmail?: string;
  contactPhone?: string;
  tags?: string[];
  footTrafficEstimate?: number;
  cancellationPolicy?: string;
  bookingWindowDays?: number;
  active?: boolean;

  // Instead of IDs, use names for simplicity
  hostTypeName?: string;
  hostCategoryName?: string;
  amenityIds?: string[];
}

// Lightweight version for listings
export interface HostSummary {
  id: string;
  name: string;
  address?: string;
  city?: string;
  zipCode?: string;
  thumbnail?: string;
  averageRating?: number;
  reviewCount?: number;
}


export interface Booth {
  id: string;
  storeId: string;
  pricePerDay: number;
  available: boolean;
}

export interface BoothSummary {
  id: string;
  storeId: string;
  pricePerDay: number;
  available: boolean;
}

