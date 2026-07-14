import { HttpClient, HttpParams } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { inject, Injectable } from '@angular/core';
import { of, tap } from 'rxjs';

import { CommunicationTypeResponse } from '../../administration/communications/interfaces';
import { environment } from '../../../../environments/environment';
import { PortalCommunicationResponse } from '../interfaces';

interface LoadCommunicationsParams {
  limit: number;
  offset: number;
  term?: string | null;
  type?: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class PortalCommunicationDataSource {
  private http = inject(HttpClient);
  private readonly URL = `${environment.baseUrl}/api/portal/communications`;

  detailCache: Record<string, PortalCommunicationResponse> = {};

  types = toSignal(this.getTypes(), { initialValue: [] });

  getDetail(id: string) {
    if (this.detailCache[id]) {
      return of(this.detailCache[id]);
    }
    return this.http.get<PortalCommunicationResponse>(`${this.URL}/${id}`).pipe(
      tap((resp) => {
        this.detailCache[id] = resp;
      }),
    );
  }

  getData(queryParams: LoadCommunicationsParams) {
    const { term, type, limit, offset } = queryParams;

    const params = new HttpParams({
      fromObject: {
        limit,
        offset,
        ...(term && { term }),
        ...(type && { typeId: type }),
      },
    });
    return this.http.get<{
      communications: PortalCommunicationResponse[];
      total: number;
    }>(this.URL, {
      params,
    });
  }

  private getTypes() {
    return this.http.get<CommunicationTypeResponse[]>(`${this.URL}/types`);
  }
}
