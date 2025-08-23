// src/app/features/booking/booking.models.ts
export interface Booking {
  id: string;
  spotId: string;
  startDate: string;  // ISO yyyy-MM-dd
  endDate: string;    // ISO yyyy-MM-dd
  status: 'PENDING'|'PAID'|'CONFIRMED'|'CANCELLED'|'COMPLETED'|'REFUNDED';
  totalPrice?: number;
  cancellationCutoffHours?: number;
}
