import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../../environments/environment';
import { PortalLandingResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class PortalLandingService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.baseUrl}/api/portal/landing`;

  getLanding() {
    return this.http.get<PortalLandingResponse>(this.url);
  }
}
