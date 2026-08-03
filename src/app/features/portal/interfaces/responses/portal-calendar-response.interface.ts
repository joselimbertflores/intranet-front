export interface PortalCalendarResponse {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay: boolean;
  description?: string | null;
  communication?: {
    id: string;
    reference: string;
    code: string;
    type: string;
  };
  isRecurring: boolean;
}
