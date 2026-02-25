import { HttpClient, HttpParams } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { inject, Injectable, signal } from '@angular/core';
import { of, tap } from 'rxjs';

import { CommunicationTypeResponse } from '../../administration/communications/interfaces';
import { environment } from '../../../../environments/environment';
import { PortalCommunicationResponse } from '../interfaces';
import { FileUploadService } from '../../../shared';

interface LoadCommunicationsParams {
  offset: number;
  term?: string;
  typeId?: number | null;
}

interface Cache {
  communications: PortalCommunicationResponse[];
  total: number;
}
@Injectable({
  providedIn: 'root',
})
export class PortalCommunicationDataSource {
  private fileUploadService = inject(FileUploadService);
  private readonly URL = `${environment.baseUrl}/portal/communications`;
  private http = inject(HttpClient);

  detailCache: Record<string, PortalCommunicationResponse> = {};
  cache: Record<string, Cache> = {};

  restoreParams = signal(false);
  paramsCache: object | null = null;

  types = toSignal(this.getTypes(), { initialValue: [] });
  testCache = signal<PortalCommunicationDataSource[]>([]);

  constructor() {}

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

  loadMore(queryParams: LoadCommunicationsParams) {
    const { term, typeId, offset } = queryParams;
    const isFilterMode = term || typeId;
    // const key = `${limit}-${offset}`;

    const params = new HttpParams({
      fromObject: {
        limit: 9,
        offset,
        ...(term && { term }),
        ...(typeId && { typeId }),
      },
    });
    // if (this.cache[key] && !isFilterMode) {
    //   return of(this.cache[key]);
    // }
    return this.http
      .get<{ communications: PortalCommunicationResponse[]; total: number }>(
        this.URL,
        {
          params,
        },
      )
      .pipe
      // tap((resp) => {
      //   if (!isFilterMode) {
      //     this.cache[key] = resp;
      //   }
      // }),
      ();
  }

  getFilterParams(): object | null {
    if (!this.restoreParams()) return null;
    return this.paramsCache;
  }

  private getTypes() {
    return this.http.get<CommunicationTypeResponse[]>(`${this.URL}/types`);
  }

  download(url: string, name: string) {
    this.fileUploadService.downloadFile(url, name);
  }
}
