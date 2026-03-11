import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, map, of, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthUser, Resource } from './auth.types';

@Injectable({
  providedIn: 'root',
})
export class AuthDataSource {
  private readonly URL = `${environment.baseUrl}/auth`;

  private http = inject(HttpClient);

  private _user = signal<AuthUser | null>(null);
  user = computed(() => this._user());

  permissions = computed(() => {
    const user = this._user();
    if (!user) return [];
    return user.roles.flatMap((r) => r.permissions);
  });

  constructor() {}

  login(login: string, password: string, remember: boolean = false) {
    if (remember) {
      localStorage.setItem('login', login);
    } else {
      localStorage.removeItem('login');
    }
    return this.http.post(
      `${this.URL}/login`,
      { login, password },
      { withCredentials: true },
    );
  }

  logout() {
    return this.http.get(`${this.URL}/logout`, { withCredentials: true });
  }

  checkAuthStatus() {
    return this.http
      .get<{ user: AuthUser }>(`${this.URL}/status`, { withCredentials: true })
      .pipe(
        tap(({ user }) => this._user.set(user)),
        map(() => true),
        catchError(() => {
          return of(false);
        }),
      );
  }

  hasResource(resource: Resource): boolean {
    return this.permissions().some((p) => p.resource === resource);
  }
}
