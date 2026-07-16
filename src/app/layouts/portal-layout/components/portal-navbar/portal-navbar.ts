import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { InstitutionalLogo } from '../../../../shared/components/institutional-logo/institutional-logo';

interface NavItem {
  label: string;
  route: string;
  exact: boolean;
  icon: string;
}

@Component({
  selector: 'portal-navbar',
  imports: [RouterLink, RouterLinkActive, InstitutionalLogo],
  template: `
    <nav
      class="relative border-b border-white/10 bg-primary-900 text-white shadow-lg shadow-primary-950/15"
      aria-label="Navegación principal"
    >
      <div
        class="mx-auto flex min-h-19 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
      >
        <a
          routerLink="/"
          (click)="closeMobileMenu()"
          class="flex min-w-0 shrink-0 items-center gap-3 rounded-xl text-white no-underline outline-none focus-visible:ring-2 focus-visible:ring-primary-200 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-900"
          aria-label="Ir al inicio de la Intranet"
        >
          <institutional-logo />

          <span class="min-w-0 leading-tight">
            <span class="block truncate text-xl font-extrabold tracking-tight">
              Intranet
            </span>
            <span
              class="mt-0.5 hidden text-[0.7rem] font-medium tracking-wide text-primary-100 sm:block"
            >
              Gobierno Autónomo Municipal de Sacaba
            </span>
          </span>
        </a>

        <div class="hidden items-center gap-0.5 xl:flex">
          @for (item of navItems; track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="bg-white/12 !text-white"
              [routerLinkActiveOptions]="{ exact: item.exact }"
              ariaCurrentWhenActive="page"
              class="relative rounded-lg px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap text-primary-100 no-underline outline-none transition-colors hover:bg-white/8 hover:text-white focus-visible:ring-2 focus-visible:ring-primary-200 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-900"
            >
              {{ item.label }}
            </a>
          }
        </div>

        <button
          type="button"
          class="grid size-11 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/8 text-white outline-none transition-colors hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-primary-200 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-900 xl:hidden"
          aria-label="Abrir o cerrar el menú de navegación"
          aria-controls="mobile-navigation"
          [attr.aria-expanded]="isMobileMenuOpen()"
          (click)="toggleMobileMenu()"
        >
          <i
            [class]="isMobileMenuOpen() ? 'ui-icon ui-icon-times' : 'ui-icon ui-icon-bars'"
            class="text-xl"
            aria-hidden="true"
          ></i>
        </button>
      </div>

      @if (isMobileMenuOpen()) {
        <div
          id="mobile-navigation"
          animate.enter="portal-mobile-menu-enter"
          animate.leave="portal-mobile-menu-leave"
          class="absolute inset-x-0 top-full z-40 border-t border-white/10 bg-primary-950 px-4 py-3 shadow-2xl shadow-primary-950/30 xl:hidden"
        >
          <div class="mx-auto grid w-full max-w-7xl gap-1 sm:grid-cols-2">
            @for (item of navItems; track item.route) {
              <a
                [routerLink]="item.route"
                routerLinkActive="bg-white/12 !text-white"
                [routerLinkActiveOptions]="{ exact: item.exact }"
                ariaCurrentWhenActive="page"
                (click)="closeMobileMenu()"
                class="flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-primary-100 no-underline outline-none transition-colors hover:bg-white/8 hover:text-white focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-200"
              >
                <i [class]="item.icon + ' text-base'" aria-hidden="true"></i>
                <span>{{ item.label }}</span>
              </a>
            }
          </div>
        </div>
      }
    </nav>
  `,
  styles: `
    :host {
      display: block;
    }

    .portal-mobile-menu-enter {
      animation: portal-mobile-menu-in 160ms cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    .portal-mobile-menu-leave {
      animation: portal-mobile-menu-out 120ms ease-in both;
    }

    @keyframes portal-mobile-menu-in {
      from {
        opacity: 0;
        transform: translateY(-0.4rem);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes portal-mobile-menu-out {
      to {
        opacity: 0;
        transform: translateY(-0.3rem);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .portal-mobile-menu-enter,
      .portal-mobile-menu-leave {
        animation: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortalNavbar {
  readonly isMobileMenuOpen = signal(false);

  readonly navItems: readonly NavItem[] = [
    { label: 'Inicio', route: '/', exact: true, icon: 'ui-icon ui-icon-home' },
    {
      label: 'Documentos',
      route: '/documents',
      exact: false,
      icon: 'ui-icon ui-icon-file',
    },
    {
      label: 'Comunicados',
      route: '/communications',
      exact: false,
      icon: 'ui-icon ui-icon-megaphone',
    },
    {
      label: 'Directorio',
      route: '/directory',
      exact: false,
      icon: 'ui-icon ui-icon-address-book',
    },
    {
      label: 'Tutoriales',
      route: '/tutorials',
      exact: false,
      icon: 'ui-icon ui-icon-graduation-cap',
    },
    {
      label: 'Calendario',
      route: '/calendar',
      exact: false,
      icon: 'ui-icon ui-icon-calendar',
    },
  ];

  @HostListener('document:keydown.escape')
  closeMobileMenuOnEscape(): void {
    this.closeMobileMenu();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((isOpen) => !isOpen);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }
}
