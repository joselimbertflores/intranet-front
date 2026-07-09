import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { DocumentFiltersResponse, PortalDocumentResponse } from '../interfaces';
import { environment } from '../../../../environments/environment';

export interface SearchPublicDocumentsParams {
  organizationalUnit?: string | null;
  documentType?: string | null;
  documentSubtype?: string | null;
  year?: number | null;
  term?: string | null;
  limit?: number;
  offset?: number;
}

@Injectable({
  providedIn: 'root',
})
export class PortalDocumentDataSource {
  private readonly URL = `${environment.baseUrl}/api/portal-documents`;
  private http = inject(HttpClient);

  documentFilters = toSignal(this.getDocumentFilters(), {
    initialValue: { organizationalUnits: [], types: [] },
  });

  constructor() {}

  searchDocuments(filterParams: SearchPublicDocumentsParams) {
    const params = new HttpParams({
      fromObject: this.removeEmptyProperties(filterParams),
    });
    return this.http.get<{
      documents: PortalDocumentResponse[];
      total: number;
    }>(`${this.URL}`, { params });
  }

  private getDocumentFilters() {
    return this.http.get<DocumentFiltersResponse>(`${this.URL}/filters`);
  }

  private removeEmptyProperties(obj: object) {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, value]) => {
        return value !== null && value !== undefined && value !== '';
      }),
    );
  }
}
