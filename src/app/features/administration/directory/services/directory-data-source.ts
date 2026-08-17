import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../../../environments/environment';
import { DirectoryEntry, DirectorySite } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class DirectoryDataSource {
  private readonly url = `${environment.baseUrl}/api/directory`;
  private readonly http = inject(HttpClient);

  findAll() {
    return this.http.get<DirectoryEntry[]>(this.url);
  }

  findAreaNames() {
    return this.http.get<string[]>(`${this.url}/area-names`);
  }

  create(payload: object) {
    return this.http.post<DirectoryEntry>(this.url, payload);
  }

  update(id: number, payload: object) {
    return this.http.patch<DirectoryEntry>(`${this.url}/${id}`, payload);
  }

  remove(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  findSites() {
    return this.http.get<DirectorySite[]>(`${this.url}/sites`);
  }

  createSite(payload: object) {
    return this.http.post<DirectorySite>(`${this.url}/sites`, payload);
  }

  updateSite(id: number, payload: object) {
    return this.http.patch<DirectorySite>(`${this.url}/sites/${id}`, payload);
  }

  removeSite(id: number) {
    return this.http.delete<void>(`${this.url}/sites/${id}`);
  }
}
