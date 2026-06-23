import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { DocumentTypeWithSubTypesResponse } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class DocumentTypeDatasource {
  private http = inject(HttpClient);
  private readonly URL = `${environment.baseUrl}/api/document-types`;
  // * For sync table with remove option in editor dialog
  private subtypeRemoved = new Subject<{ typeId: number; subtypeId: number }>();

  subtypeRemoved$ = this.subtypeRemoved.asObservable();

  findAll(limit: number, offset: number, term: string) {
    const params = new HttpParams({
      fromObject: { limit, offset, ...(term && { term }) },
    });
    return this.http.get<{
      data: DocumentTypeWithSubTypesResponse[];
      total: number;
    }>(this.URL, { params });
  }

  create(form: object) {
    return this.http.post<DocumentTypeWithSubTypesResponse>(this.URL, form);
  }

  update(id: number, form: object) {
    return this.http.patch<DocumentTypeWithSubTypesResponse>(
      `${this.URL}/${id}`,
      form,
    );
  }

  removeSubtype(id: number) {
    return this.http.delete<{ ok: boolean; message: string }>(
      `${this.URL}/subtype/${id}`,
    );
  }

  emitSubtypeRemoved(typeId: number, subtypeId: number) {
    this.subtypeRemoved.next({ typeId, subtypeId });
  }
}
