export interface CalendarEventResponse {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string | null;
  allDay: boolean;
  recurrenceRule: string | null;
  recurrenceConfig: RecurrenceConfigResponse | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecurrenceConfigResponse {
  until: null;
  interval: number;
  frequency: string;
  byWeekDays: string[];
}
