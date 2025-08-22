export interface Store {
  id: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  averageRating?: number;
  reviewCount?: number;
}

export interface Spot {
  id: string;
  storeId: string;
  pricePerDay: number;
  available: boolean;
}
