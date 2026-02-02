import { inject, Injectable, linkedSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import {
  DocSectionManageResponse,
  DocumentTypeResponse,
} from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class DocumentSectionDataSource {
  private http = inject(HttpClient);

  private readonly URL = `${environment.baseUrl}/document-sections`;

  resource = toSignal(
    this.http.get<DocSectionManageResponse[]>(this.URL),
    {
      initialValue: [],
    },
  );
  dataSource = linkedSignal(() => this.resource());

  constructor() {}

  create(form: object) {
    return this.http
      .post<DocSectionManageResponse>(this.URL, form)
      .pipe(tap((resp) => this.addItem(resp)));
  }

  update(id: number, form: object) {
    return this.http
      .patch<DocSectionManageResponse>(`${this.URL}/${id}`, form)
      .pipe(tap((resp) => this.addItem(resp)));
  }

  getDocumentTypes() {
    return this.http.get<DocumentTypeResponse[]>(`${this.URL}/types`);
  }

  private addItem(newItem: DocSectionManageResponse) {
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
}
