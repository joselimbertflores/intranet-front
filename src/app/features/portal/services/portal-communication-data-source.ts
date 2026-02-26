import { HttpClient, HttpParams } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { inject, Injectable } from '@angular/core';
import { of, tap } from 'rxjs';

import { CommunicationTypeResponse } from '../../administration/communications/interfaces';
import { environment } from '../../../../environments/environment';
import { PortalCommunicationResponse } from '../interfaces';
import { FileUploadService } from '../../../shared';

interface LoadCommunicationsParams {
  limit: number;
  offset: number;
  term?: string | null;
  type?: number | null;
}

export interface CommunicationsSnapshot {
  items: PortalCommunicationResponse[];
  total: number;
  filters: { term?: string; typeId?: number | null };
}

@Injectable({
  providedIn: 'root',
})
export class PortalCommunicationDataSource {
  private http = inject(HttpClient);
  private fileUploadService = inject(FileUploadService);
  private readonly URL = `${environment.baseUrl}/portal/communications`;

  detailCache: Record<string, PortalCommunicationResponse> = {};
  cache: Record<string, Cache> = {};

  types = toSignal(this.getTypes(), { initialValue: [] });

  private snapshot: CommunicationsSnapshot | null = null;
  private shouldRestore = false;

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

  getData(queryParams: LoadCommunicationsParams) {
    const { term, type: typeId, offset } = queryParams;
    const isFilterMode = term !== '' || typeId !== null;

    const params = new HttpParams({
      fromObject: {
        limit: 6,
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

  saveSnapshot(snapshot: CommunicationsSnapshot) {
    this.snapshot = snapshot;
    this.shouldRestore = true;
  }

  consumeSnapshot(): CommunicationsSnapshot | null {
    if (!this.shouldRestore) return null;

    this.shouldRestore = false;

    const snap = this.snapshot;
    this.snapshot = null;
    return snap;
  }

  clearSnapshot() {
    this.snapshot = null;
    this.shouldRestore = false;
  }

  private getTypes() {
    return this.http.get<CommunicationTypeResponse[]>(`${this.URL}/types`);
  }
}
