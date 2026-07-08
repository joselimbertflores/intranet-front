import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { environment } from '../../../../environments/environment';

import { DocumentFiltersResponse, PortalDocumentResponse } from '../interfaces';

export interface SearchPublicDocumentsParams {
  term?: string | null;
  unit?: string | null;
  type?: string | null;
  subtype?: string | null;
  year?: number | null;
  limit: number;
  offset: number;
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
      fromObject: {
        ...(filterParams.unit && { organizationalUnit: filterParams.unit }),
        ...(filterParams.type && { organizationalUnit: filterParams.type }),
        ...(filterParams.subtype && {
          organizationalUnit: filterParams.subtype,
        }),
        ...(filterParams.year && { organizationalUnit: filterParams.year }),
        ...(filterParams.term && { organizationalUnit: filterParams.term }),
        ...(filterParams.offset && { organizationalUnit: filterParams.offset }),
        ...(filterParams.limit && { organizationalUnit: filterParams.limit }),
      },
    });
    console.log(filterParams);
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

  private removeEmptyProperties(obj: object) {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, value]) => {
        return value !== null && value !== undefined && value !== '';
      }),
    );
  }
}
