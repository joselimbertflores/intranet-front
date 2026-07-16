import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationStart, Router, RouterModule } from '@angular/router';
import { Component, effect, inject, signal } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { CdkScrollable } from '@angular/cdk/scrolling';

import { filter, map } from 'rxjs';


import { ProfileOverlay, AdminSidebar } from './components';

const DESKTOP_MEDIA_QUERY = '(min-width: 64rem)';

@Component({
  selector: 'app-admin-layout',
  host: {
    class: 'fixed inset-0 block h-dvh min-h-0 overflow-hidden',
  },
  imports: [
    RouterModule,
   
    AdminSidebar,
    ProfileOverlay,
    CdkScrollable,
  ],
  templateUrl: './admin-layout.component.html',
})
export default class AdminLayoutComponent {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly router = inject(Router);

  readonly mobileMenuOpen = signal(false);

  readonly isDesktop = toSignal(
    this.breakpointObserver
      .observe(DESKTOP_MEDIA_QUERY)
      .pipe(map(({ matches }) => matches)),
    {
      initialValue: this.breakpointObserver.isMatched(DESKTOP_MEDIA_QUERY),
    },
  );

  constructor() {
    effect(() => {
      if (this.isDesktop()) {
        this.mobileMenuOpen.set(false);
      }
    });

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationStart),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.mobileMenuOpen.set(false));
  }

  openMobileMenu(): void {
    if (!this.isDesktop()) {
      this.mobileMenuOpen.set(true);
    }
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
