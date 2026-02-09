import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../../environments/environment';
import { SectionTreeNodeResponse } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class SectionDataSource {
  private http = inject(HttpClient);

  private readonly URL = `${environment.baseUrl}/sections`;

  readonly sections = signal<SectionTreeNodeResponse[]>([]);

  constructor() {
    this.getTreeSections();
  }

  getTreeSections() {
    return this.http
      .get<SectionTreeNodeResponse[]>(this.URL)
      .subscribe((data) => {
        this.sections.set(data);
      });
  }

  create(form: object) {
    return this.http.post<SectionTreeNodeResponse>(this.URL, form);
  }

  update(id: string, form: Record<string, string | number | boolean>) {
    delete form['parentId'];
    return this.http.patch<SectionTreeNodeResponse>(`${this.URL}/${id}`, form);
  }
}
