import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../../../../environments/environment';
import { CalendarEventResponse } from '../interfaces';

export interface FormCalendarProps {
  title: string;
  description: string;
  startDate: Date;
  endDate?: Date | null;
  allDay?: boolean;
  recurrence?: RecurrenceConfig | null;
  communicationId?: string | null;
}

export interface RecurrenceConfig {
  frequency: string | null;
  interval: number;
  byWeekDays: string[];
  until?: Date | null;
}

@Injectable({
  providedIn: 'root',
})
export class CalendarDataSource {
  private readonly URL = `${environment.baseUrl}/api/calendar`;
  private http = inject(HttpClient);

  constructor() {}

  create(form: FormCalendarProps) {
    const { recurrence, ...props } = form;
    return this.http.post(this.URL, {
      ...props,
      recurrence: recurrence?.frequency
        ? this.toRecurrenceDto(recurrence)
        : null,
    });
  }

  update(id: string, form: Partial<FormCalendarProps>) {
    const { recurrence, ...props } = form;
    return this.http.patch(`${this.URL}/${id}`, {
      ...props,
      recurrence: recurrence?.frequency
        ? this.toRecurrenceDto(recurrence)
        : null,
    });
  }

  findAll(limit: number, offset: number, term?: string) {
    const params = new HttpParams({
      fromObject: { limit, offset, ...(term && { term }) },
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
    return this.http.delete(`${this.URL}/${id}`);
  }

  private toRecurrenceDto(recurrence: RecurrenceConfig) {
    return {
      frequency: recurrence.frequency,
      interval: recurrence.interval,
      until: recurrence.until,
      ...(recurrence.frequency === 'WEEKLY' && {
        byWeekDays: recurrence.byWeekDays,
      }),
    };
  }
}
