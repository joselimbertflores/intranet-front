import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import {
  DocumentFiltersResponse,
  PortalDocumentResponse,
  PortalDocumentSearchResponse,
} from '../interfaces';
import { environment } from '../../../../environments/environment';

export interface SearchPublicDocumentsParams {
  organizationalUnit?: string | null;
  type?: string | null;
  subtype?: string | null;
  year?: number | null;
  validityStatus?: PortalDocumentResponse['validityStatus'] | null;
  term?: string | null;
  limit: number;
  offset: number;
}

@Injectable({
  providedIn: 'root',
})
export class PortalDocumentDataSource {
  private readonly URL = `${environment.baseUrl}/api/portal-documents`;
  private readonly http = inject(HttpClient);

  readonly documentFilters = toSignal(
    this.http.get<DocumentFiltersResponse>(`${this.URL}/filters`),
    { initialValue: { organizationalUnits: [], types: [] } },
  );

  searchDocuments(filterParams: SearchPublicDocumentsParams) {
    const params = new HttpParams({
      fromObject: this.removeEmptyProperties(filterParams),
    });
    return this.http.get<PortalDocumentSearchResponse>(this.URL, { params });
  }

  private removeEmptyProperties(
    obj: SearchPublicDocumentsParams,
  ): Record<string, string | number> {
    return Object.fromEntries(
      Object.entries(obj).filter(
        (entry): entry is [string, string | number] => {
          const value = entry[1];
          return value !== null && value !== undefined && value !== '';
        },
      ),
    );
  }
}
