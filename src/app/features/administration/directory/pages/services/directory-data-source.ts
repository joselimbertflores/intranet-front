import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../../../../environments/environment';
import { TreeDirectoryResponse } from '../../interfaces';

// models.ts
export interface DirectorySection {
  id: string;
  name: string;
  order: number;
  isActive: boolean;
  parent?: DirectorySection | null; // opcional si lo traes del backend
  children?: DirectorySection[];
  parentId?: string | null; // útil para front
}

export interface DirectoryContact {
  id: string;
  title: string;
  internalPhone?: string | null;
  externalPhone?: string | null;
  order: number;
  isActive: boolean;
  sectionId: string;
}

@Injectable({
  providedIn: 'root',
})
export class DirectoryDataSource {
  private readonly URL = `${environment.baseUrl}/directory`;
  private http = inject(HttpClient);

  constructor() {}

  create(dto: object) {
    return this.http.post<DirectorySection>(this.URL, dto);
  }

  update(id: number, dto: object) {
    return this.http.patch<DirectorySection>(`${this.URL}/${id}`, dto);
  }

  remove(id: number) {
    return this.http.delete(`${this.URL}/${id}`);
  }

  getTreeDirectory() {
    return this.http.get<TreeDirectoryResponse[]>(this.URL, {});
  }
}
