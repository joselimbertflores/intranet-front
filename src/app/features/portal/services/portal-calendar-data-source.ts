import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { map, tap } from 'rxjs';
import { PortalCalendarResponse } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class PortalCalendarDataSource {
  private http = inject(HttpClient);
  private readonly URL = `${environment.baseUrl}/portal-calendar`;
  constructor() {}

  getEvents(start: string, end: string) {
    return this.http.get<PortalCalendarResponse[]>(`${this.URL}/events`, {
      params: { start, end },
    });
  }
}
