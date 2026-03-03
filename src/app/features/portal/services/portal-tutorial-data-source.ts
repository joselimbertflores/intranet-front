import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

interface LoadCommunicationsParams {
  limit: number;
  offset: number;
  term?: string | null;
  type?: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class PortalTutorialDataSource {
  private readonly URL = `${environment.baseUrl}/portal-tutorials`;
  private http = inject(HttpClient);

  constructor() {}

  getData() {
    return this.http.get<{ tutorials: any[]; total: number }>(
      this.URL
    );
  }

  findBySlug(slug: string) {
    return this.http.get<any>(`${this.URL}/${slug}`);
  }
}
