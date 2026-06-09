import { inject } from '@angular/core';
import { RedirectCommand, Router, type CanActivateFn } from '@angular/router';

import { AuthDataSource } from '../auth-data-source';
import { Resource } from '../auth.types';

export const resourceGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const authDataSource = inject(AuthDataSource);

  const resource = route.data['resource'];
  if (!isResource(resource)) return true;

  if (!authDataSource.hasAnyResourcePermission(resource)) {
    return new RedirectCommand(router.parseUrl('/admin/forbidden'));
  }

  return true;
};

function isResource(value: unknown): value is Resource {
  return Object.values(Resource).includes(value as Resource);
}
