import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { environment } from '../../../../../environments/environment';
import { TutorialCategoryResponse } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class TutorialCategoryDataSource {
  private http = inject(HttpClient);
  private readonly URL = `${environment.baseUrl}/tutorial-categories`;

  categories = toSignal(this.findAll(), { initialValue: [] });

  private findAll() {
    return this.http.get<TutorialCategoryResponse[]>(`${this.URL}`);
  }

  create(dto: object) {
    return this.http.post<TutorialCategoryResponse>(`${this.URL}`, dto);
  }

  update(id: number, dto: object) {
    return this.http.patch<TutorialCategoryResponse>(`${this.URL}/${id}`, dto);
  }

  remove(id: number) {
    return this.http.delete<{ ok: boolean; message: string }>(
      `${this.URL}/${id}`,
    );
  }
}
