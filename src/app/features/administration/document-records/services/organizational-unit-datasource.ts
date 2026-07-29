import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../../../environments/environment';
import {
  CreateOrganizationalUnitDto,
  OrganizationalUnitResponse,
  UpdateOrganizationalUnitDto,
} from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class OrganizationalUnitDatasource {
  private readonly http = inject(HttpClient);
  private readonly URL = `${environment.baseUrl}/api/organizational-units`;

  findTree() {
    return this.http.get<OrganizationalUnitResponse[]>(this.URL);
  }

  create(dto: CreateOrganizationalUnitDto) {
    return this.http.post<OrganizationalUnitResponse>(this.URL, dto);
  }

  update(id: number, dto: UpdateOrganizationalUnitDto) {
    return this.http.patch<OrganizationalUnitResponse>(
      `${this.URL}/${id}`,
      dto,
    );
  }

  remove(id: number) {
    return this.http.delete<void>(`${this.URL}/${id}`);
  }
}
