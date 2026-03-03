import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { environment } from '../../../../environments/environment';
import { PortalTutorialResponse } from '../interfaces';

interface LoadTutorialsParams {
  limit: number;
  offset: number;
  term?: string | null;
  category?: number | null;
}

export interface TutorialsSnapshot {
  items: PortalTutorialResponse[];
  total: number;
  filters: { term?: string; category?: number | null };
}

@Injectable({
  providedIn: 'root',
})
export class PortalTutorialDataSource {
  private readonly URL = `${environment.baseUrl}/portal-tutorials`;
  private http = inject(HttpClient);

  private snapshot: TutorialsSnapshot | null = null;

  categories = toSignal(
    this.http.get<{ id: number; name: string }[]>(`${this.URL}/categories`),
  );

  constructor() {}

  getData(filterParams: LoadTutorialsParams) {
    const { term, category, limit, offset } = filterParams;

    const params = new HttpParams({
      fromObject: {
        limit,
        offset,
        ...(term && { term }),
        ...(category && { categoryId: category }),
      },
    });
    return this.http.get<{
      tutorials: PortalTutorialResponse[];
      total: number;
    }>(this.URL, { params });
  }

  findBySlug(slug: string) {
    return this.http.get<any>(`${this.URL}/${slug}`);
  }

  saveSnapshot(snapshot: TutorialsSnapshot) {
    this.snapshot = snapshot;
  }

  consumeSnapshot(): TutorialsSnapshot | null {
    const snap = this.snapshot;
    this.snapshot = null;
    return snap;
  }
}
