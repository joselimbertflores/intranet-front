import { inject, Injectable, linkedSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient, HttpParams } from '@angular/common/http';
import { tap } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { DocumentTypeWithSubTypesResponse } from '../interfaces';

interface FilterParas {
  limit?: number;
  offset?: number;
  term?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DocumentTypeDataSource {
  private http = inject(HttpClient);

  private readonly URL = `${environment.baseUrl}/api/document-types`;

  resource = toSignal(
    this.http.get<DocumentTypeWithSubTypesResponse[]>(this.URL),
    {
      initialValue: [],
    },
  );
  dataSource = linkedSignal(() => this.resource());

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
    return this.http
      .post<DocumentTypeWithSubTypesResponse>(this.URL, form)
      .pipe(
        tap((resp) => {
          this.addItem(resp);
        }),
      );
  }

  update(id: number, form: object) {
    return this.http
      .patch<DocumentTypeWithSubTypesResponse>(`${this.URL}/${id}`, form)
      .pipe(
        tap((resp) => {
          this.addItem(resp);
        }),
      );
  }

  removeSubtype(typeId: number, subtypeId: number) {
    return this.http
      .delete<{
        ok: boolean;
        message: string;
      }>(`${this.URL}/subtype/${subtypeId}`)
      .pipe(
        tap(({ ok }) => {
          if (!ok) return;
          this.removeSubItem(typeId, subtypeId);
        }),
      );
  }

  private addItem(newItem: DocumentTypeWithSubTypesResponse) {
    const index = this.dataSource().findIndex((item) => item.id === newItem.id);
    if (index !== -1) {
      this.dataSource.update((values) => {
        values[index] = newItem;
        return [...values];
      });
    } else {
      this.dataSource.update((values) => [newItem, ...values]);
    }
  }

  private removeSubItem(typeId: number, subtypeId: number) {
    const typeIndex = this.dataSource().findIndex(({ id }) => id === typeId);
    if (typeIndex === -1) return;
    this.dataSource.update((values) => {
      values[typeIndex].subtypes = values[typeIndex].subtypes?.filter(
        (subtype) => subtype.id !== subtypeId,
      );
      return [...values];
    });
  }
}
