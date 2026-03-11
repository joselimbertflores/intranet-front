import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../../../../environments/environment';
import {
  PermissionsCatalog,
  RoleResponse,
} from '../interfaces';

interface FindRolesParams {
  term: string;
  limit: number;
  offset: number;
}
@Injectable({
  providedIn: 'root',
})
export class RoleDataSource {
  private http = inject(HttpClient);
  private URL = `${environment.baseUrl}/roles`;

  permissions = toSignal(
    this.http.get<PermissionsCatalog[]>(`${this.URL}/permissions`),
    { initialValue: [] },
  );

  constructor() {}

  create(form: object) {
    return this.http.post(this.URL, form);
  }

  update(id: string, form: object) {
    return this.http.patch(`${this.URL}/${id}`, form);
  }

  findAll({ term, limit, offset }: FindRolesParams) {
    const params = new HttpParams({
      fromObject: { limit, offset, ...(term && { term }) },
    });
    return this.http
      .get<{ roles: RoleResponse[]; total: number }>(this.URL, {
        params,
      })
  }
}
