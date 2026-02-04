import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';

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
  private base = `${environment.baseUrl}/directory`;

  constructor(private http: HttpClient) {}

  // Sections
  getSections(): Observable<DirectorySection[]> {
    return this.http.get<DirectorySection[]>(`${this.base}/sections`);
  }

  createSection(dto: { name: string; parentId?: string; order?: number }) {
    return this.http.post<DirectorySection>(`${this.base}/sections`, dto);
  }

  updateSection(
    id: string,
    dto: Partial<{
      name: string;
      parentId: string | null;
      order: number;
      isActive: boolean;
    }>,
  ) {
    return this.http.patch<DirectorySection>(
      `${this.base}/sections/${id}`,
      dto,
    );
  }

  // Contacts
  getContactsBySection(sectionId: string): Observable<DirectoryContact[]> {
    return this.http.get<DirectoryContact[]>(
      `${this.base}/sections/${sectionId}/contacts`,
    );
  }

  createContact(dto: {
    sectionId: string;
    title: string;
    internalPhone?: string | null;
    externalPhone?: string | null;
    order?: number;
  }) {
    return this.http.post<DirectoryContact>(`${this.base}/contacts`, dto);
  }

  updateContact(
    id: string,
    dto: Partial<{
      title: string;
      internalPhone: string | null;
      externalPhone: string | null;
      order: number;
      isActive: boolean;
    }>,
  ) {
    return this.http.patch<DirectoryContact>(
      `${this.base}/contacts/${id}`,
      dto,
    );
  }
}
