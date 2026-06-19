import { inject, Injectable, linkedSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { DocumentTypeWithSubTypesResponse } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class DocumentTypeDatasource {
  private http = inject(HttpClient);

  private readonly URL = `${environment.baseUrl}/api/document-types`;

  resource = toSignal(
    this.http.get<DocumentTypeWithSubTypesResponse[]>(this.URL),
    {
      initialValue: [],
    },
  );
  dataSource = linkedSignal(() => this.resource());

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

  removeSubtype(id: number) {
    return this.http
      .delete<{
        ok: boolean;
        message: string;
      }>(`${this.URL}/subtype/${id}`)
      .pipe
      // tap(({ ok }) => {
      //   if (ok) {
      //     this.removeSubItem(parentId, id);
      //   }
      // }),
      ();
  }

  emitSubtypeRemoved(typeId: number, subtypeId: number) {
    this.subtypeRemoved.next({ typeId, subtypeId });
  }

  private addItem(newItem: DocumentTypeWithSubTypesResponse) {
    console.log(this.dataSource());
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

  private removeSubItem(parentId: number, subtypeId: number) {
    const index = this.dataSource().findIndex(({ id }) => id === parentId);
    if (index === -1) return;
    this.dataSource.update((values) => {
      values[index].subtypes = values[index].subtypes.filter(
        ({ id }) => id !== subtypeId,
      );
      return [...values];
    });
  }
}
