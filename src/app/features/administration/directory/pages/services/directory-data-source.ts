import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../../../../environments/environment';
import {
  DirectoryEntryPayload,
  DirectoryEntryResponse,
  DirectorySite,
  DirectorySitePayload,
} from '../../interfaces';

@Injectable({ providedIn: 'root' })
export class DirectoryDataSource {
  private readonly url = `${environment.baseUrl}/api/directory`;
  private readonly http = inject(HttpClient);

  findAll(term = '', siteId: number | null = null) {
    let params = new HttpParams();
    if (term.trim()) params = params.set('term', term.trim());
    if (siteId) params = params.set('siteId', siteId);
    return this.http.get<DirectoryEntryResponse[]>(this.url, { params });
  }

  findAreaNames() {
    return this.http.get<string[]>(`${this.url}/area-names`);
  }

  create(dto: DirectoryEntryPayload) {
    return this.http.post<DirectoryEntryResponse>(this.url, dto);
  }

  update(id: number, dto: DirectoryEntryPayload) {
    return this.http.patch<DirectoryEntryResponse>(`${this.url}/${id}`, dto);
  }

  remove(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }

  findSites() {
    return this.http.get<DirectorySite[]>(`${this.url}/sites`);
  }

  createSite(dto: DirectorySitePayload) {
    return this.http.post<DirectorySite>(`${this.url}/sites`, dto);
  }

  updateSite(id: number, dto: DirectorySitePayload) {
    return this.http.patch<DirectorySite>(`${this.url}/sites/${id}`, dto);
  }

  removeSite(id: number) {
    return this.http.delete(`${this.url}/sites/${id}`);
  }
}
