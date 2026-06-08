import { RedirectCommand, Router, type CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';

import { AuthDataSource } from '../auth-data-source';

export const permissionGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authDataSource = inject(AuthDataSource);

  const permission = route.data['permission'];
  if (typeof permission !== 'string') return true;

  if (!authDataSource.hasPermission(permission)) {
    return new RedirectCommand(router.parseUrl('/admin/forbidden'));
  }

  return true;
};
