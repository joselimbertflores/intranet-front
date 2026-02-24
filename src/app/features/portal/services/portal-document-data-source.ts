import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { environment } from '../../../../environments/environment';

import { DocumentFiltersResponse, PortalDocumentResponse } from '../interfaces';

interface SearchDocumentsParams {
  limit: number;
  offset: number;
  term?: string;
  section?: string;
  type?: string;
  subtype?: string;
  year?: number;
}

@Injectable({
  providedIn: 'root',
})
export class PortalDocumentDataSource {
  private readonly URL = `${environment.baseUrl}/portal-documents`;
  private http = inject(HttpClient);

  documentFilters = toSignal(this.getDocumentFilters(), {
    initialValue: { sections: [], types: [] },
  });

  constructor() {}

  searchDocuments(filterParams: SearchDocumentsParams) {
    const params = new HttpParams({
      fromObject: this.removeEmptyProperties(filterParams),
    });
    return this.http.get<{
      documents: PortalDocumentResponse[];
      total: number;
    }>(`${this.URL}`, {
      params,
    });
  }

  private getDocumentFilters() {
    return this.http.get<DocumentFiltersResponse>(`${this.URL}/filters`);
  }

  private removeEmptyProperties<T extends object>(obj: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, value]) => {
        return value !== null && value !== undefined && value !== '';
      }),
    ) as Partial<T>;
  }
}
