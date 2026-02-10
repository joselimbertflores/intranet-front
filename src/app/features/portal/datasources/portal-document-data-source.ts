import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { environment } from '../../../../environments/environment';

import { DocumentFiltersResponse } from '../interfaces';

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

  getDocumentFilters() {
    return this.http.get<DocumentFiltersResponse>(
      `${this.URL}/document-filters`,
    );
  }
}
