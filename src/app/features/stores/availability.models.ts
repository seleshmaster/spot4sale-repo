export interface AvailabilityRangeDTO {
  /** ISO dates 'YYYY-MM-DD' that are not bookable */
  blackouts: string[];
  /** Optional ISO weekday numbers 1..7 (Mon..Sun) that are open.
   *  If missing or empty => treat as "open all days except blackouts"
   */
  openWeekdays?: number[];
}
