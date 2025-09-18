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

  // REVIEW FIELDS
  averageRating?: number;
  reviewCount?: number;
  showReviews?: boolean;  // <-- toggle for UI to show/hide reviews
}

export interface HostModel {
  name: string;
  address: string;
  city: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  images?: File[];
}

export  interface HostSummary {
  id: string;
  name: string;
  address?: string;
  city?: string;
  zipCode?: string;
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

