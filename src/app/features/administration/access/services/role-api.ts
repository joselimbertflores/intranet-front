import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../../../../environments/environment';
import { GroupedPermissionResponse, RoleResponse } from '../interfaces';

interface FindRolesParams {
  term?: string;
  limit: number;
  offset: number;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  isAutoAssigned: boolean;
  permissionIds: number[];
}

export type UpdateRoleDto = Partial<CreateRoleDto>;

@Injectable({
  providedIn: 'root',
})
export class RoleApi {
  private readonly http = inject(HttpClient);
  private readonly URL = `${environment.baseUrl}/api/roles`;

  create(dto: CreateRoleDto) {
    return this.http.post<RoleResponse>(this.URL, dto);
  }

  update(id: string, dto: UpdateRoleDto) {
    return this.http.patch<RoleResponse>(`${this.URL}/${id}`, dto);
  }

  findAll({ term, limit, offset }: FindRolesParams) {
    const params = new HttpParams({
      fromObject: { limit, offset, ...(term && { term }) },
    });
    return this.http.get<{ roles: RoleResponse[]; total: number }>(this.URL, {
      params,
    });
  }

  getPermissions() {
    return this.http.get<GroupedPermissionResponse[]>(
      `${this.URL}/permissions`,
    );
  }
}
