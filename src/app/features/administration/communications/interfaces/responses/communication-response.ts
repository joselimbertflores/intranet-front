import { CalendarEventResponse } from '../../../calendar/interfaces';

export interface CommunicationManageResponse {
  id: string;
  reference: string;
  code: string;
  fileName: string;
  previewFileName: string;
  originalName: string;
  createdAt: Date;
  type: CommunicationTypeResponse;
  calendarEvent: CalendarEventResponse | null;
}

export interface CommunicationTypeResponse {
  id: number;
  name: string;
}
