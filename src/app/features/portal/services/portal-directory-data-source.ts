import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import {
  DirectoryEntryResponse,
  DirectorySite,
} from '../../administration/directory/interfaces';
import { environment } from '../../../../environments/environment';

export interface PortalDirectoryFilters {
  term: string;
  siteId: number | null;
}

@Injectable({ providedIn: 'root' })
export class PortalDirectoryDataSource {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.baseUrl}/api/portal-directory`;

  readonly sites = toSignal(
    this.http.get<DirectorySite[]>(`${this.url}/sites`),
    { initialValue: [] },
  );

  findAll({ term, siteId }: PortalDirectoryFilters) {
    let params = new HttpParams();
    if (term.trim()) params = params.set('term', term.trim());
    if (siteId) params = params.set('siteId', siteId);
    return this.http.get<DirectoryEntryResponse[]>(this.url, { params });
  }
}
