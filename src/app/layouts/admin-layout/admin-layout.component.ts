import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { RouterModule } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';

import { ProfileOverlay, Sidebar } from './components';
import { CdkScrollable } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-admin-layout',
  imports: [
    RouterModule,
    ButtonModule,
    DrawerModule,
    Sidebar,
    ProfileOverlay,
    CdkScrollable,
  ],
  templateUrl: './admin-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminLayoutComponent {
  isMobile = signal(false);
  mobileMenuOpen = signal(false);

  constructor(private breakpoint: BreakpointObserver) {
    this.breakpoint.observe('(max-width: 1023px)').subscribe(({ matches }) => {
      if (!matches) {
        this.mobileMenuOpen.set(false);
      }
      this.isMobile.set(matches);
    });
  }

  openMobileMenu() {
    this.mobileMenuOpen.set(true);
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }
}
