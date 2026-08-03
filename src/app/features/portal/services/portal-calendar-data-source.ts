import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, shareReplay, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { PortalCalendarResponse } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class PortalCalendarDataSource {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.baseUrl}/api/portal-calendar`;
  private readonly rangeCache = new Map<
    string,
    Observable<PortalCalendarResponse[]>
  >();

  getEvents(start: string, end: string): Observable<PortalCalendarResponse[]> {
    const cacheKey = `${start}|${end}`;
    const cached = this.rangeCache.get(cacheKey);
    if (cached) return cached;

    const request = this.http
      .get<PortalCalendarResponse[]>(`${this.url}/events`, {
        params: { start, end },
      })
      .pipe(
        tap({ error: () => this.rangeCache.delete(cacheKey) }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    this.rangeCache.set(cacheKey, request);
    return request;
  }
}
