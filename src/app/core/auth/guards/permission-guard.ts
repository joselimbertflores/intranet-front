import { RedirectCommand, Router, type CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';

import { AuthDataSource } from '../auth-data-source';

export const permissionGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authDataSource = inject(AuthDataSource);

  const permissions = authDataSource.permissions();

  const resource = route.data['resource'];
  if (!resource) return true;

  const hasPermission = permissions.some((p) => p.resource === resource);

  if (!hasPermission) {
    return new RedirectCommand(router.parseUrl('/admin'));
  }

  return true;
};
