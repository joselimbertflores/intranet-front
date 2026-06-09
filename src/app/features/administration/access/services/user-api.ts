import { HttpClient, HttpParams } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../../../environments/environment';
import { UserResponse } from '../interfaces';

interface roles {
  id: string;
  name: string;
  description: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserApi {
  private http = inject(HttpClient);
  private readonly URL = `${environment.baseUrl}/api/users`;

  findAll(limit: number, offset: number, term?: string) {
    const params = new HttpParams({
      fromObject: { limit, offset, ...(term && { term }) },
    });
    return this.http.get<{ users: UserResponse[]; total: number }>(this.URL, {
      params,
    });
  }

  update(id: string, roleIds: string[]) {
    return this.http.patch(`${this.URL}/${id}`, { roleIds });
  }

  getRoles() {
    return this.http.get<roles[]>(`${this.URL}/roles`);
  }
}
