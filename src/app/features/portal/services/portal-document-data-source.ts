import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import {
  DocumentFiltersResponse,
  PortalDocumentSearchResponse,
} from '../interfaces';
import { environment } from '../../../../environments/environment';

export interface SearchPublicDocumentsParams {
  organizationalUnit?: string | null;
  type?: string | null;
  subtype?: string | null;
  year?: number | null;
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

  /**
   * Recurso compartido por toda la aplicación. Al vivir en este servicio root,
   * conserva el catálogo al navegar fuera de Documentos y volver.
   */
  readonly documentFiltersResource = rxResource({
    stream: () => this.getDocumentFilters(),
  });

  searchDocuments(filterParams: SearchPublicDocumentsParams) {
    const params = new HttpParams({
      fromObject: this.removeEmptyProperties(filterParams),
    });
    return this.http.get<PortalDocumentSearchResponse>(this.URL, { params });
  }

  getDocumentFilters() {
    return this.http.get<DocumentFiltersResponse>(`${this.URL}/filters`);
  }

  reloadDocumentFilters(): void {
    this.documentFiltersResource.reload();
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
