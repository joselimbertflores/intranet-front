import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { TutorialResponse } from '../../administration/tutorials/interfaces';


@Injectable({
  providedIn: 'root',
})
export class PortalTutorialData {
  private readonly URL = `${environment.baseUrl}/portal/assistance`;
  private http = inject(HttpClient);

  constructor() {}

  getTutorials() {
    return this.http.get<{ tutorials: TutorialResponse[]; total: number }>(
      this.URL
    );
  }

  findBySlug(slug: string) {
    return this.http.get<TutorialResponse>(`${this.URL}/${slug}`);
  }
}
