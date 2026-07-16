import { BreakpointObserver } from '@angular/cdk/layout';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { Component, inject, linkedSignal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationStart, Router, RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLandmark, lucideMenu } from '@ng-icons/lucide';

import { HlmSheetImports } from '@spartan-ng/helm/sheet';
import { HlmButton } from '@spartan-ng/helm/button';
import { filter, map } from 'rxjs';

import { AdminSidebar, UserMenu } from './components';

const DESKTOP_MEDIA_QUERY = '(min-width: 64rem)';

@Component({
  selector: 'app-admin-layout',
  host: {
    class: 'fixed inset-0 block h-dvh min-h-0 overflow-hidden',
  },
  imports: [
    RouterOutlet,
    AdminSidebar,
    UserMenu,
    CdkScrollable,
    NgIcon,
    HlmButton,
    HlmSheetImports,
  ],
  providers: [provideIcons({ lucideLandmark, lucideMenu })],
  templateUrl: './admin-layout.component.html',
})
export default class AdminLayoutComponent {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly router = inject(Router);

  readonly isDesktop = toSignal(
    this.breakpointObserver
      .observe(DESKTOP_MEDIA_QUERY)
      .pipe(map(({ matches }) => matches)),
    {
      initialValue: this.breakpointObserver.isMatched(DESKTOP_MEDIA_QUERY),
    },
  );

  readonly mobileMenuOpen = linkedSignal({
    source: this.isDesktop,
    computation: () => false,
  });

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationStart),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.mobileMenuOpen.set(false));
  }
}
