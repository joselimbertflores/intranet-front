import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../../environments/environment';

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

@Injectable({
  providedIn: 'root',
})
export class CalendarDataSource {
  private readonly URL = `${environment.baseUrl}/calendar`;
  private http = inject(HttpClient);

  constructor() {}

  create(form: FormCalendarProps) {
    const { recurrence, ...props } = form;
    return this.http.post(this.URL, {
      ...props,
      recurrence: recurrence?.frequency ? recurrence : null,
    });
  }

  findAll() {
    return this.http.get<{ events: any[]; total: number }>(this.URL);
  }
}
