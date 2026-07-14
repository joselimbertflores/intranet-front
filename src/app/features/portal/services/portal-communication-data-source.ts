import { HttpClient, HttpParams } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { inject, Injectable } from '@angular/core';

import { CommunicationTypeResponse } from '../../administration/communications/interfaces';
import { environment } from '../../../../environments/environment';
import { PortalCommunicationResponse } from '../interfaces';

interface LoadCommunicationsParams {
  limit: number;
  offset: number;
  term?: string | null;
  typeId?: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class PortalCommunicationDataSource {
  private http = inject(HttpClient);
  private readonly URL = `${environment.baseUrl}/api/portal/communications`;

  types = toSignal(this.getTypes(), { initialValue: [] });

  getData(queryParams: LoadCommunicationsParams) {
    const { term, typeId, limit, offset } = queryParams;

    const params = new HttpParams({
      fromObject: {
        limit,
        offset,
        ...(term && { term }),
        ...(typeId && { typeId }),
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
