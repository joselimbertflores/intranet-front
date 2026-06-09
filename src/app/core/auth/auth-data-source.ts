import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, map, of, tap } from 'rxjs';

import { AuthUser, PermissionAction, Resource } from './auth.types';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthDataSource {
  private readonly URL = `${environment.baseUrl}/api/auth`;

  private http = inject(HttpClient);

  private _user = signal<AuthUser | null>(null);
  user = computed(() => this._user());

  private readonly _permissions = computed<string[]>(() => {
    const user = this._user();
    if (!user) return [];
    return user.permissions;
  });

  constructor() {}

  login(login: string, password: string, remember: boolean = false) {
    if (remember) {
      localStorage.setItem('login', login);
    } else {
      localStorage.removeItem('login');
    }
    return this.http.post(
      `${environment.baseUrl}/login`,
      { login, password },
      { withCredentials: true },
    );
  }

  logout() {
    return this.http
      .post(`${this.URL}/logout`, {}, { withCredentials: true })
      .pipe(tap(() => this._user.set(null)));
  }

  checkAuthStatus() {
    return this.http
      .get<{ user: AuthUser }>(`${this.URL}/me`, { withCredentials: true })
      .pipe(
        tap(({ user }) => this._user.set(user)),
        map(() => true),
        catchError(() => {
          this._user.set(null);
          return of(false);
        }),
      );
  }

  permissions(): string[] {
    return this._permissions();
  }

  hasPermission(permission: string): boolean {
    return this.permissions().includes(permission);
  }

  can(resource: Resource, action: PermissionAction | string): boolean {
    return this.hasPermission(`${resource}:${action}`);
  }

  hasAnyResourcePermission(resource: Resource): boolean {
    return this.permissions().some((permission) =>
      permission.startsWith(`${resource}:`),
    );
  }
}
