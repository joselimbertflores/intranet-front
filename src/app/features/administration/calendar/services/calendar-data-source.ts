import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../../../../environments/environment';
import {
  CalendarEventResponse,
  RecurrenceFrequency,
  WeekDay,
} from '../interfaces';

export interface SaveCalendarEventDto {
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  isActive: boolean;
  recurrence: RecurrenceConfigDto | null;
  communicationId?: string | null;
}

export interface RecurrenceConfigDto {
  frequency: RecurrenceFrequency;
  interval: number;
  byWeekDays?: WeekDay[];
  until?: Date | null;
}

export interface GetCalendarEventsParams {
  term?: string;
  limit: number;
  offset: number;
}

@Injectable({
  providedIn: 'root',
})
export class CalendarDataSource {
  private readonly URL = `${environment.baseUrl}/api/calendar`;
  private readonly http = inject(HttpClient);

  create(data: SaveCalendarEventDto) {
    return this.http.post<CalendarEventResponse>(this.URL, data);
  }

  update(id: string, data: SaveCalendarEventDto) {
    return this.http.patch<CalendarEventResponse>(`${this.URL}/${id}`, data);
  }

  findAll({ term, ...pagination }: GetCalendarEventsParams) {
    const params = new HttpParams({
      fromObject: { ...pagination, ...(term && { term }) },
    });
    return this.http.get<{
      events: CalendarEventResponse[];
      total: number;
    }>(this.URL, { params });
  }

  getOne(id: string) {
    return this.http.get<CalendarEventResponse>(`${this.URL}/${id}`);
  }

  remove(id: string) {
    return this.http.delete<void>(`${this.URL}/${id}`);
  }

  removeWithCommunication(eventId: string) {
    return this.http.delete<void>(
      `${this.URL}/${eventId}/with-communication`,
    );
  }
}
