import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../../../environments/environment';
import {
  DocumentTypeCreateDto,
  DocumentTypeUpdateDto,
  DocumentTypeWithSubTypesResponse,
} from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class DocumentTypeDatasource {
  private http = inject(HttpClient);
  private readonly URL = `${environment.baseUrl}/api/document-types`;

  findAll(limit: number, offset: number, term: string) {
    const params = new HttpParams({
      fromObject: { limit, offset, ...(term && { term }) },
    });
    return this.http.get<{
      data: DocumentTypeWithSubTypesResponse[];
      total: number;
    }>(this.URL, { params });
  }

  create(dto: DocumentTypeCreateDto) {
    return this.http.post<DocumentTypeWithSubTypesResponse>(this.URL, dto);
  }

  update(id: number, dto: DocumentTypeUpdateDto) {
    return this.http.patch<DocumentTypeWithSubTypesResponse>(
      `${this.URL}/${id}`,
      dto,
    );
  }

  remove(id: number) {
    return this.http.delete<void>(`${this.URL}/${id}`);
  }
}
