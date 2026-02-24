import { toSignal } from '@angular/core/rxjs-interop';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { TreeDirectoryResponse } from '../../administration/directory/interfaces';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PortalDirectoryDataSource {
  private http = inject(HttpClient);
  private readonly URL = `${environment.baseUrl}/portal-directory`;

  directory = toSignal(this.getDirectory(), { initialValue: [] });

  constructor() {}

  getDirectory() {
    return this.http.get<TreeDirectoryResponse[]>(this.URL);
  }
}
