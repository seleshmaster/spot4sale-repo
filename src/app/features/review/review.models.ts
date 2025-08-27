export interface Review {
  id: string;             // UUID as string
  reviewerId: string;     // UUID of the user who wrote the review
  targetType: 'STORE' | 'SELLER';
  targetId: string;       // UUID of the store or seller being reviewed
  rating: number;         // 1..5
  comment?: string;       // optional comment
  createdAt: string;      // ISO date string
}
