import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, of, tap, throwError } from 'rxjs';

import { AuthUser, PermissionAction, Resource } from './auth.types';
import { environment } from '../../../environments/environment';

const AUTH_CHANNEL_NAME = 'intranet-auth';

interface AuthChannelMessage {
  type: 'logout';
}

@Injectable({
  providedIn: 'root',
})
export class AuthDataSource {
  private readonly URL = `${environment.baseUrl}/api/auth`;

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authChannel = new BroadcastChannel(AUTH_CHANNEL_NAME);

  private _user = signal<AuthUser | null>(null);
  user = computed(() => this._user());

  private readonly _permissions = computed<string[]>(() => {
    const user = this._user();
    if (!user) return [];
    return user.permissions;
  });

  constructor() {
    this.authChannel.addEventListener('message', this.handleAuthMessage);
    this.destroyRef.onDestroy(() => {
      this.authChannel.removeEventListener('message', this.handleAuthMessage);
      this.authChannel.close();
    });
  }

  logout() {
    return this.http
      .post(`${this.URL}/logout`, {}, { withCredentials: true })
      .pipe(
        catchError((error: unknown) => {
          if (error instanceof HttpErrorResponse && error.status === 401) {
            return of(null);
          }

          return throwError(() => error);
        }),
        tap(() => {
          this.clearUser();
          this.authChannel.postMessage({
            type: 'logout',
          } satisfies AuthChannelMessage);
        }),
      );
  }

  checkAuthStatus() {
    return this.http
      .get<{ user: AuthUser }>(`${this.URL}/me`, { withCredentials: true })
      .pipe(
        tap(({ user }) => this._user.set(user)),
        map(() => true),
        catchError((error: unknown) => {
          if (error instanceof HttpErrorResponse && error.status === 401) {
            this._user.set(null);
            return of(false);
          }

          return throwError(() => error);
        }),
      );
  }

  clearUser(): void {
    this._user.set(null);
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

  private readonly handleAuthMessage = (event: MessageEvent<unknown>): void => {
    const message = event.data as Partial<AuthChannelMessage> | null;
    if (message?.type !== 'logout') return;

    this.clearUser();
    const path = this.router.url.split(/[?#]/)[0];
    if (path === '/administration' || path.startsWith('/administration/')) {
      void this.router.navigate(['/'], { replaceUrl: true });
    }
  };
}
