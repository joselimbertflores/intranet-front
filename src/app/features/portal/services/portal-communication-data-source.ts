import { HttpClient, HttpParams } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { inject, Injectable } from '@angular/core';
import { of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { FileUploadService } from '../../../shared';
import { PortalCommunicationResponse } from '../interfaces';
import { CommunicationTypeResponse } from '../../administration/communications/interfaces';

interface GetCommunicationsParams {
  limit: number;
  offset: number;
  term?: string;
  typeId?: number | null;
}
@Injectable({
  providedIn: 'root',
})
export class PortalCommunicationDataSource {
  private fileUploadService = inject(FileUploadService);
  private readonly URL = `${environment.baseUrl}/portal/communications`;
  private http = inject(HttpClient);

  detailCache: Record<string, PortalCommunicationResponse> = {};

  cache: Record<string, { communications: any[]; total: number }> = {};

  types = toSignal(this.getTypes(), { initialValue: [] });

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

  findAll(queryParams: GetCommunicationsParams) {
    const { term, typeId, limit, offset } = queryParams;
    const isFilterMode = term || typeId;
    const key = `${limit}-${offset}`;

    const params = new HttpParams({
      fromObject: {
        limit,
        offset,
        ...(term && { term }),
        ...(typeId && { typeId }),
      },
    });
    if (this.cache[key] && !isFilterMode) {
      return of(this.cache[key]);
    }
    return this.http
      .get<{ communications: PortalCommunicationResponse[]; total: number }>(
        this.URL,
        {
          params,
        },
      )
      .pipe(
        tap((resp) => {
          if (!isFilterMode) {
            this.cache[key] = resp;
          }
        }),
      );
  }

  private getTypes() {
    return this.http.get<CommunicationTypeResponse[]>(`${this.URL}/types`);
  }

  download(url: string, name: string) {
    this.fileUploadService.downloadFile(url, name);
  }
}
