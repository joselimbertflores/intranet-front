import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../../environments/environment';
import {
  PortalAuthorityResponse,
  PortalDirectoryEntryResponse,
  PortalDirectorySiteResponse,
} from '../interfaces';

@Injectable({ providedIn: 'root' })
export class PortalDirectoryDataSource {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.baseUrl}/api/portal-directory`;

  getEntries() {
    return this.http.get<PortalDirectoryEntryResponse[]>(this.url);
  }

  getSites() {
    return this.http.get<PortalDirectorySiteResponse[]>(`${this.url}/sites`);
  }

  getAuthorities() {
    return this.http.get<PortalAuthorityResponse[]>(`${this.url}/authorities`);
  }
}
