import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCalendarDays,
  lucideContactRound,
  lucideFileText,
  lucideGraduationCap,
  lucideHome,
  lucideMegaphone,
  lucideMenu,
  lucideX,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';

import { InstitutionalLogo } from '../../../../shared/components/institutional-logo/institutional-logo';
import { ThemeSwitcher } from '../../../../shared/components/theme-switcher/theme-switcher';

interface NavItem {
  label: string;
  route: string;
  exact: boolean;
  icon: string;
}

@Component({
  selector: 'portal-navbar',
  imports: [
    HlmButtonImports,
    InstitutionalLogo,
    NgIcon,
    RouterLink,
    RouterLinkActive,
    ThemeSwitcher,
  ],
  providers: [
    provideIcons({
      lucideCalendarDays,
      lucideContactRound,
      lucideFileText,
      lucideGraduationCap,
      lucideHome,
      lucideMegaphone,
      lucideMenu,
      lucideX,
    }),
  ],
  template: `
    <nav
      class="relative border-b border-white/10 bg-[var(--portal-forest)] text-white shadow-[0_14px_30px_-24px_rgb(3_29_19/0.8)]"
      aria-label="Navegación principal"
    >
      <div
        class="mx-auto flex min-h-20 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8"
      >
        <a
          routerLink="/"
          (click)="closeMobileMenu()"
          class="flex min-w-0 shrink-0 items-center gap-3 rounded-xl text-white no-underline outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--portal-forest)]"
          aria-label="Ir al inicio de la Intranet"
        >
          <institutional-logo
            class="grid size-14 shrink-0 place-items-center [&>div]:!size-14 [&>div]:!border-white/90 [&>div>div]:!bg-transparent [&_svg]:!size-10"
          />

          <span class="min-w-0 leading-tight">
            <span class="block truncate text-[1.65rem] font-black tracking-tight">
              Intranet
            </span>
            <span
              class="mt-0.5 hidden text-[0.78rem] font-semibold tracking-wide text-white/82 sm:block"
            >
              Gobierno Autónomo Municipal de Sacaba
            </span>
          </span>
        </a>

        <div class="ml-auto hidden items-center gap-0.5 xl:flex">
          @for (item of navItems; track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="bg-white/12 !text-white"
              [routerLinkActiveOptions]="{ exact: item.exact }"
              ariaCurrentWhenActive="page"
              class="relative rounded-lg px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap text-white/80 no-underline outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--portal-forest)]"
            >
              {{ item.label }}
            </a>
          }
        </div>

        <button
          type="button"
          hlmBtn
          variant="secondary"
          size="icon"
          class="ml-auto shrink-0 xl:hidden"
          aria-label="Abrir o cerrar el menú de navegación"
          aria-controls="mobile-navigation"
          [attr.aria-expanded]="isMobileMenuOpen()"
          (click)="toggleMobileMenu()"
        >
          <ng-icon [name]="isMobileMenuOpen() ? 'lucideX' : 'lucideMenu'" />
        </button>

        <app-theme-switcher class="shrink-0" />
      </div>

      @if (isMobileMenuOpen()) {
        <div
          id="mobile-navigation"
          animate.enter="portal-mobile-menu-enter"
          animate.leave="portal-mobile-menu-leave"
          class="absolute inset-x-0 top-full z-40 border-t border-white/10 bg-[var(--portal-forest)] px-4 py-3 shadow-[0_24px_40px_-24px_rgb(3_29_19/0.9)] xl:hidden"
        >
          <div class="mx-auto grid w-full max-w-7xl gap-1 sm:grid-cols-2">
            @for (item of navItems; track item.route) {
              <a
                [routerLink]="item.route"
                routerLinkActive="bg-white/12 !text-white"
                [routerLinkActiveOptions]="{ exact: item.exact }"
                ariaCurrentWhenActive="page"
                (click)="closeMobileMenu()"
                class="flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white/80 no-underline outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
              >
                <ng-icon [name]="item.icon" aria-hidden="true" />
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
      --portal-forest: #073d2a;
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
    { label: 'Inicio', route: '/', exact: true, icon: 'lucideHome' },
    {
      label: 'Documentos',
      route: '/documents',
      exact: false,
      icon: 'lucideFileText',
    },
    {
      label: 'Comunicados',
      route: '/communications',
      exact: false,
      icon: 'lucideMegaphone',
    },
    {
      label: 'Directorio',
      route: '/directory',
      exact: false,
      icon: 'lucideContactRound',
    },
    {
      label: 'Tutoriales',
      route: '/tutorials',
      exact: false,
      icon: 'lucideGraduationCap',
    },
    {
      label: 'Calendario',
      route: '/calendar',
      exact: false,
      icon: 'lucideCalendarDays',
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
