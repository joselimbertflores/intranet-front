import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { tap } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { CalendarEventResponse, FormCalendarProps } from '../interfaces';

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

  update(id: string, form: Partial<FormCalendarProps>) {
    const { recurrence, ...props } = form;
    return this.http.patch(`${this.URL}/${id}`, {
      ...props,
      recurrence: recurrence?.frequency ? recurrence : null,
    });
  }

  findAll(limit: number, offset: number, term?: string) {
    const params = new HttpParams({
      fromObject: { limit, offset, ...(term && { term }) },
    });
    return this.http
      .get<{
        events: CalendarEventResponse[];
        total: number;
      }>(this.URL, { params })
      .pipe(tap((resp) => console.log(resp)));
  }
}
