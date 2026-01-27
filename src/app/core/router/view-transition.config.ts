import { inject } from '@angular/core';
import { Router, ViewTransitionInfo } from '@angular/router';

export function handleTransitionCreated({ transition }: ViewTransitionInfo) {
  const router = inject(Router);

  const targetUrl = router.currentNavigation()?.finalUrl ?? '';

  const config = {
    paths: 'exact',
    matrixParams: 'exact',
    fragment: 'ignored',
    queryParams: 'ignored',
  } as const;

  if (router.isActive(targetUrl, config)) {
    transition.skipTransition();
    return;
  }
}
