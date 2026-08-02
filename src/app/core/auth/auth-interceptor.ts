import {
  HttpErrorResponse,
  type HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthDataSource } from './auth-data-source';

let sessionRedirectInProgress = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authDataSource = inject(AuthDataSource);
  const request = req.clone({ withCredentials: true });

  return next(request).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !isAuthFlowRequest(req.url)
      ) {
        authDataSource.clearUser();
        redirectAdministrativeRequestToLogin();
      }

      return throwError(() => error);
    }),
  );
};

function isAuthFlowRequest(url: string): boolean {
  return [
    '/api/auth/me',
    '/api/auth/logout',
    '/auth/login',
    '/auth/callback',
  ].some((path) => url.includes(path));
}

function redirectAdministrativeRequestToLogin(): void {
  if (
    typeof window === 'undefined' ||
    sessionRedirectInProgress ||
    !window.location.pathname.startsWith('/administration')
  ) {
    return;
  }

  sessionRedirectInProgress = true;
  const returnUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  window.location.href = `${environment.baseUrl}/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`;
}
