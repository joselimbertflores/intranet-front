export interface CalendarEventDto {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay: boolean;
  extendedProps: {
    description?: string;
    communicationId?: string;
    isRecurring?: boolean;
    originalEventId?: string;
  };
}
