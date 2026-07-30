export interface CalendarEventResponse {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  allDay: boolean;
  recurrenceConfig: RecurrenceConfigResponse | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  communicationId: string | null;
}

export interface RecurrenceConfigResponse {
  frequency: RecurrenceFrequency;
  interval: number;
  byWeekDays?: WeekDay[];
  until?: string;
}

export type RecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export type WeekDay = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU';
