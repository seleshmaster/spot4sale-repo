// src/app/features/booking/booking.models.ts
import {HostSummary, BoothSummary} from '../../hosts/models/host.models';

export interface Booking {
  id: string;
  spotId: string;
  startDate: string;  // ISO yyyy-MM-dd
  endDate: string;    // ISO yyyy-MM-dd
  status: 'PENDING'|'PAID'|'CONFIRMED'|'CANCELLED'|'COMPLETED'|'REFUNDED';
  totalPrice?: number;
  cancellationCutoffHours?: number;
}

export interface BookingDetails {
  id: string;
  userId: string;
  spotId: string;
  startDate: string;
  endDate: string;
  status: string;
  totalPrice: number; // or string if BigDecimal serialized as string
  store: HostSummary;
  spot: BoothSummary;
}
