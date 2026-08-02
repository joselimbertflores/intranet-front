import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../../../environments/environment';
import {
  TutorialCategoryDeleteResponse,
  TutorialCategoryPayload,
  TutorialCategoryResponse,
} from '../interfaces';

@Injectable({ providedIn: 'root' })
export class TutorialCategoryDataSource {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.baseUrl}/api/tutorial-categories`;

  findAll() {
    return this.http.get<TutorialCategoryResponse[]>(this.url);
  }

  create(payload: TutorialCategoryPayload) {
    return this.http.post<TutorialCategoryResponse>(this.url, payload);
  }

  update(id: number, payload: TutorialCategoryPayload) {
    return this.http.patch<TutorialCategoryResponse>(
      `${this.url}/${id}`,
      payload,
    );
  }

  remove(id: number) {
    return this.http.delete<TutorialCategoryDeleteResponse>(
      `${this.url}/${id}`,
    );
  }
}
