export interface SeasonDTO {
  id: string;
  startDate: string; // ISO
  endDate: string;   // ISO
  openWeekdays?: number[];
  note?: string;
}
