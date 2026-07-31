import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../../../environments/environment';
import {
  DirectoryEntriesResponse,
  DirectoryEntry,
  DirectoryEntryFilters,
  DirectoryEntryPayload,
  DirectorySite,
  DirectorySitePayload,
} from '../interfaces';

@Injectable({ providedIn: 'root' })
export class DirectoryDataSource {
  private readonly url = `${environment.baseUrl}/api/directory`;
  private readonly http = inject(HttpClient);

  findAll({
    limit,
    offset,
    term = '',
    siteId = null,
    isActive = null,
  }: DirectoryEntryFilters) {
    let params = new HttpParams().set('limit', limit).set('offset', offset);
    const normalizedTerm = term.trim();

    if (normalizedTerm) params = params.set('term', normalizedTerm);
    if (siteId !== null) params = params.set('siteId', siteId);
    if (isActive !== null) params = params.set('isActive', isActive);

    return this.http.get<DirectoryEntriesResponse>(this.url, { params });
  }

  findAreaNames() {
    return this.http.get<string[]>(`${this.url}/area-names`);
  }

  create(payload: DirectoryEntryPayload) {
    return this.http.post<DirectoryEntry>(this.url, payload);
  }

  update(id: number, payload: DirectoryEntryPayload) {
    return this.http.patch<DirectoryEntry>(`${this.url}/${id}`, payload);
  }

  remove(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  findSites() {
    return this.http.get<DirectorySite[]>(`${this.url}/sites`);
  }

  createSite(payload: DirectorySitePayload) {
    return this.http.post<DirectorySite>(`${this.url}/sites`, payload);
  }

  updateSite(id: number, payload: DirectorySitePayload) {
    return this.http.patch<DirectorySite>(`${this.url}/sites/${id}`, payload);
  }

  removeSite(id: number) {
    return this.http.delete<void>(`${this.url}/sites/${id}`);
  }
}
