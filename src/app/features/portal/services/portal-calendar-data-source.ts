import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PortalCalendarDataSource {
  private http = inject(HttpClient);
  private readonly URL = `${environment.baseUrl}/portal-calendar`;
  constructor() {}

  getEvents(start: string, end: string) {
    return this.http
      .get<any[]>(`${this.URL}/events`, {
        params: { start, end },
      })
      .pipe(tap((resp) => console.log(resp)));
  }
}
