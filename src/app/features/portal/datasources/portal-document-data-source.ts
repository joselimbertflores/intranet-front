import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { environment } from '../../../../environments/environment';

import { DocumentFiltersResponse } from '../interfaces';

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
  private readonly URL = `${environment.baseUrl}/portal`;
  private http = inject(HttpClient);

  documentFilters = toSignal(this.getDocumentFilters(), {
    initialValue: { sections: [], types: [] },
  });

  constructor() {}

  searchDocuments(filterParams: SearchDocumentsParams) {
    const params = new HttpParams({
      fromObject: this.removeEmptyProperties(filterParams),
    });
    console.log(params);
    return this.http.get<{ documents: any[]; total: number }>(
      `${this.URL}/documents`,
      { params },
    );
  }

  private getDocumentFilters() {
    return this.http.get<DocumentFiltersResponse>(
      `${this.URL}/document-filters`,
    );
  }

  private removeEmptyProperties<T extends object>(obj: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, value]) => {
        return value !== null && value !== undefined && value !== '';
      }),
    ) as Partial<T>;
  }
}
