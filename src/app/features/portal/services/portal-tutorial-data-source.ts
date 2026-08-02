import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../../environments/environment';
import {
  PortalTutorialDetailResponse,
  PortalTutorialListParams,
  PortalTutorialListResponse,
  TutorialCategory,
} from '../interfaces';

@Injectable({ providedIn: 'root' })
export class PortalTutorialDataSource {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.baseUrl}/api/portal-tutorials`;

  findAll({ term, category, limit, offset }: PortalTutorialListParams) {
    const params = new HttpParams({
      fromObject: {
        limit,
        offset,
        ...(term && { term }),
        ...(category && { category }),
      },
    });
    return this.http.get<PortalTutorialListResponse>(this.url, { params });
  }

  getCategories() {
    return this.http.get<TutorialCategory[]>(`${this.url}/categories`);
  }

  findBySlug(slug: string) {
    return this.http.get<PortalTutorialDetailResponse>(`${this.url}/${slug}`);
  }
}
