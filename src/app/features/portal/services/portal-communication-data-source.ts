import { HttpClient, HttpParams } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../../environments/environment';
import {
  PortalCommunicationResponse,
  PortalCommunicationTypeResponse,
} from '../interfaces';

export interface LoadCommunicationsParams {
  limit: number;
  offset: number;
  term?: string | null;
  typeId?: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class PortalCommunicationDataSource {
  private readonly http = inject(HttpClient);
  private readonly URL = `${environment.baseUrl}/api/portal/communications`;

  readonly typesResource = rxResource({ stream: () => this.getTypes() });

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

  reloadTypes(): void {
    this.typesResource.reload();
  }

  private getTypes() {
    return this.http.get<PortalCommunicationTypeResponse[]>(
      `${this.URL}/types`,
    );
  }
}
