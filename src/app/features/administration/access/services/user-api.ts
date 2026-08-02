import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../../../environments/environment';
import {
  IdentityCandidateResponse,
  RoleOptionResponse,
  UserResponse,
} from '../interfaces';

export interface FindUsersParams {
  limit: number;
  offset: number;
  term?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserApi {
  private readonly http = inject(HttpClient);
  private readonly URL = `${environment.baseUrl}/api/users`;

  findAll({ limit, offset, term }: FindUsersParams) {
    const params = new HttpParams({
      fromObject: { limit, offset, ...(term && { term }) },
    });
    return this.http.get<{ users: UserResponse[]; total: number }>(this.URL, {
      params,
    });
  }

  update(id: string, roleIds: string[]) {
    return this.http.patch<UserResponse>(`${this.URL}/${id}`, { roleIds });
  }

  getRoles() {
    return this.http.get<RoleOptionResponse[]>(`${this.URL}/roles`);
  }

  findIdentityCandidates(term: string) {
    return this.http.get<IdentityCandidateResponse[]>(
      `${this.URL}/identity-candidates`,
      {
        params: new HttpParams({ fromObject: { term } }),
      },
    );
  }

  importFromIdentity(externalKey: string, roleIds: string[]) {
    return this.http.post<UserResponse>(`${this.URL}/import-from-identity`, {
      externalKey,
      roleIds,
    });
  }
}
