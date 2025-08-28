export interface Store {
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


export interface Spot {
  id: string;
  storeId: string;
  pricePerDay: number;
  available: boolean;
}
