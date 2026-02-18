import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { TutorialCategoryResponse, TutorialResponse } from '../../interfaces';
import { environment } from '../../../../../environments/environment';

interface PaginatioParams {
  term: string;
  limit: number;
  offset: number;
}

@Injectable({
  providedIn: 'root',
})
export class TutorialDataSource {
  private http = inject(HttpClient);
  private readonly URL = `${environment.baseUrl}/tutorials`;

  findAll({ limit, offset, term }: PaginatioParams) {
    const params = new HttpParams({
      fromObject: { limit, offset, ...(term && { term }) },
    });
    return this.http.get<{ tutorials: TutorialResponse[]; total: number }>(
      `${this.URL}`,
      { params },
    );
  }

  create(dto: object) {
    return this.http.post(`${this.URL}`, dto);
  }

  update(id: string, dto: object) {
    return this.http.patch(`${this.URL}/${id}`, dto);
  }

  getCategories() {
    return this.http.get<TutorialCategoryResponse[]>(`${this.URL}/categories`);
  }

  getOne(id: string) {
    return this.http.get<TutorialResponse>(`${this.URL}/${id}`);
  }
}
