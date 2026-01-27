import { inject } from '@angular/core';
import { type CanActivateFn } from '@angular/router';
import { tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthDataSource } from './auth-data-source';

export const isAuthenticatedGuard: CanActivateFn = (route, state) => {
  const authDataSource = inject(AuthDataSource);
  return authDataSource.checkAuthStatus().pipe(
    tap((isAuth) => {
      if (!isAuth) {
        window.location.href = `${environment.baseUrl}/auth/login?returnUrl=${state.url}`;
      }
    })
  );
};
