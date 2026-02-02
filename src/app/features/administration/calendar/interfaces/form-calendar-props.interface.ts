export interface FormCalendarProps {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date | null;
  allDay: boolean;
  recurrence?: RecurrenceConfig;
}

export interface RecurrenceConfig {
  frequency: string | null;
  interval: number;
  byWeekDays: string[];
  until?: Date | null;
}
