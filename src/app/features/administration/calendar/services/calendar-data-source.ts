import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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

  findAll() {
    return this.http
      .get<{ events: CalendarEventResponse[]; total: number }>(this.URL)
      .pipe(tap((resp) => console.log(resp)));
  }
}
