import { inject } from '@angular/core';
import { isActive, Router, ViewTransitionInfo } from '@angular/router';

export function handleTransitionCreated({ transition }: ViewTransitionInfo) {
  const router = inject(Router);
  const targetUrl = router.currentNavigation()?.finalUrl;

  if (!targetUrl) {
    return;
  }

  const config = {
    paths: 'exact',
    matrixParams: 'exact',
    fragment: 'ignored',
    queryParams: 'ignored',
  } as const;

  const isTargetRouteCurrent = isActive(targetUrl, router, config);

  if (isTargetRouteCurrent()) {
    transition.skipTransition();
  }
}
