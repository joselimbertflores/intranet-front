import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { environment } from '../../../../environments/environment';
import {
  PortalDirectoryEntryResponse,
  PortalDirectorySiteResponse,
} from '../interfaces';

@Injectable({ providedIn: 'root' })
export class PortalDirectoryDataSource {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.baseUrl}/api/portal-directory`;

  readonly entriesResource = rxResource({ stream: () => this.findAll() });
  readonly sitesResource = rxResource({ stream: () => this.findSites() });

  reload(): void {
    this.entriesResource.reload();
    this.sitesResource.reload();
  }

  reloadSites(): void {
    this.sitesResource.reload();
  }

  private findAll() {
    return this.http.get<PortalDirectoryEntryResponse[]>(this.url);
  }

  private findSites() {
    return this.http.get<PortalDirectorySiteResponse[]>(`${this.url}/sites`);
  }
}
