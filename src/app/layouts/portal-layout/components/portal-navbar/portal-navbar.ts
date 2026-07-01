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
      class="relative border-b border-surface-200/80 bg-surface-0/90 shadow-sm shadow-surface-950/5 backdrop-blur-md"
      aria-label="Navegación principal"
    >
      <div
        class="mx-auto flex min-h-18 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
      >
        <a
          routerLink="/"
          (click)="closeMobileMenu()"
          class="flex min-w-0 shrink-0 items-center gap-3 rounded-xl no-underline outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0"
          aria-label="Ir al inicio de la Intranet"
        >
          <institutional-logo />

          <span class="min-w-0 leading-tight">
            <span
              class="block truncate text-base font-bold tracking-tight text-surface-950"
            >
              Intranet
            </span>
            <span
              class="hidden text-xs font-medium tracking-wide text-surface-500 sm:block"
            >
              GAM Sacaba
            </span>
          </span>
        </a>

        <div class="hidden items-center gap-1 lg:flex">
          @for (item of navItems; track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="bg-primary-50 !text-primary-700"
              [routerLinkActiveOptions]="{ exact: item.exact }"
              ariaCurrentWhenActive="page"
              class="rounded-full px-3.5 py-2 text-sm font-semibold whitespace-nowrap text-surface-600 no-underline outline-none transition-colors hover:bg-surface-100 hover:text-surface-900 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0"
            >
              {{ item.label }}
            </a>
          }
        </div>

        <button
          type="button"
          class="grid size-11 shrink-0 place-items-center rounded-xl text-surface-700 outline-none transition-colors hover:bg-surface-100 hover:text-surface-950 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0 lg:hidden"
          aria-label="Abrir o cerrar el menú de navegación"
          aria-controls="mobile-navigation"
          [attr.aria-expanded]="isMobileMenuOpen()"
          (click)="toggleMobileMenu()"
        >
          @if (isMobileMenuOpen()) {
            <svg
              class="size-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          } @else {
            <svg
              class="size-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              aria-hidden="true"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          }
        </button>
      </div>

      @if (isMobileMenuOpen()) {
        <div
          id="mobile-navigation"
          animate.enter="portal-mobile-menu-enter"
          animate.leave="portal-mobile-menu-leave"
          class="absolute inset-x-0 top-full z-40 px-3 pt-2 lg:hidden"
        >
          <div
            class="mx-auto w-full max-w-7xl rounded-xl border border-surface-200/80 bg-surface-0/95 p-1.5 shadow-xl shadow-surface-950/15 ring-1 ring-surface-950/5 backdrop-blur-md"
          >
            <div class="flex flex-col gap-1">
              @for (item of navItems; track item.route) {
                <a
                  [routerLink]="item.route"
                  routerLinkActive="bg-primary-50 !text-primary-700"
                  [routerLinkActiveOptions]="{ exact: item.exact }"
                  ariaCurrentWhenActive="page"
                  (click)="closeMobileMenu()"
                  class="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-surface-600 no-underline outline-none transition-colors hover:bg-surface-100 hover:text-surface-900 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500"
                >
                  <i
                    [class]="item.icon + ' text-base text-surface-500'"
                    aria-hidden="true"
                  ></i>

                  <span>{{ item.label }}</span>
                </a>
              }
            </div>
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
        transform: translateY(-0.5rem) scale(0.98);
      }

      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes portal-mobile-menu-out {
      from {
        opacity: 1;
        transform: translateY(0) scale(1);
      }

      to {
        opacity: 0;
        transform: translateY(-0.35rem) scale(0.98);
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
    { label: 'Inicio', route: '/', exact: true, icon: 'pi pi-home' },
    {
      label: 'Documentos',
      route: '/documents',
      exact: false,
      icon: 'pi pi-file',
    },
    {
      label: 'Comunicados',
      route: '/communications',
      exact: false,
      icon: 'pi pi-megaphone',
    },
    {
      label: 'Directorio',
      route: '/directory',
      exact: false,
      icon: 'pi pi-address-book',
    },
    {
      label: 'Tutoriales',
      route: '/tutorials',
      exact: false,
      icon: 'pi pi-graduation-cap',
    },
    {
      label: 'Calendario',
      route: '/calendar',
      exact: false,
      icon: 'pi pi-calendar',
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
