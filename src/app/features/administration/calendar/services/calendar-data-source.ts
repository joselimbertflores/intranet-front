import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import utc from 'dayjs/plugin/utc';
import dayjs from 'dayjs';

dayjs.extend(utc);

import { environment } from '../../../../../environments/environment';

export interface FormCalendarProps {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date | null;
  allDay: boolean;
}

type Frecuency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface RecurrenceConfig {
  frequency: Frecuency;
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

  create(form: FormCalendarProps, recurrence: RecurrenceConfig) {
    const { startDate, endDate, ...props } = form;
    const recurrenceRule = this.buildRRule(recurrence);
    return this.http.post(this.URL, {
      ...props,
      startDate: startDate.toString(),
      ...(endDate && { endDate: endDate.toString() }),
      // ...(recurrenceRule && { recurrenceRule:"Texto de prueba" }),
    });
  }

  buildRRule(recurrence: RecurrenceConfig): string | null {
    let rule = `FREQ=${recurrence.frequency}`;

    if (recurrence.interval > 1) {
      rule += `;INTERVAL=${recurrence.interval}`;
    }

    if (recurrence.frequency === 'WEEKLY' && recurrence.byWeekDays.length) {
      rule += `;BYDAY=${recurrence.byWeekDays.join(',')}`;
    }

    if (recurrence.until) {
      const untilDate =
        dayjs(recurrence.until).endOf('day').utc().format('YYYYMMDDTHHmmss') +
        'Z';
      rule += `;UNTIL=${untilDate}`;
    }

    return rule;
  }
}
