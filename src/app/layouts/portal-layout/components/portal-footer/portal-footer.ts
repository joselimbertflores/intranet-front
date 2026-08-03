import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { InstitutionalLogo } from '../../../../shared/components/institutional-logo/institutional-logo';

interface FooterLink {
  label: string;
  route: string;
}

@Component({
  selector: 'portal-footer',
  imports: [InstitutionalLogo, RouterLink],
  host: {
    style: '--portal-forest: #063f2b; --portal-gold: #d8b84d;',
  },
  template: `
    <footer
      class="relative overflow-hidden border-t-4 border-[var(--portal-gold)] bg-[var(--portal-forest)] text-white"
    >
      <div
        class="relative mx-auto flex w-full max-w-7xl flex-col gap-9 px-5 py-10 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:py-12"
      >
        <section class="max-w-xl" aria-labelledby="portal-footer-brand">
          <div class="flex items-start gap-3.5">
            <institutional-logo
              class="grid size-14 shrink-0 place-items-center [&>div]:!size-14 [&>div]:!border-white/85 [&>div>div]:!bg-transparent [&_svg]:!size-10"
            />

            <div class="min-w-0 pt-0.5">
              <h2
                id="portal-footer-brand"
                class="text-base leading-snug font-bold text-white"
              >
                Gobierno Autónomo Municipal de Sacaba
              </h2>
              <p class="mt-1 text-sm font-semibold text-white/80">
                Intranet institucional
              </p>
            </div>
          </div>

        </section>

        <nav aria-label="Enlaces del pie de página">
          <ul class="flex max-w-xl flex-wrap gap-x-6 gap-y-3">
            @for (item of footerLinks; track item.route) {
              <li>
                <a
                  [routerLink]="item.route"
                  class="text-sm font-semibold text-white/80 underline-offset-4 outline-none transition-colors hover:text-white hover:underline focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--portal-forest)]"
                >
                  {{ item.label }}
                </a>
              </li>
            }
          </ul>
        </nav>
      </div>

      <div class="relative border-t border-white/10">
        <div
          class="mx-auto flex w-full max-w-7xl flex-col gap-2 px-5 py-3.5 text-xs text-white/65 sm:flex-row sm:items-center sm:justify-between sm:px-8"
        >
          <p>© {{ currentYear }} Gobierno Autónomo Municipal de Sacaba.</p>
          <p class="font-medium text-white/75">Intranet institucional</p>
        </div>
      </div>
    </footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortalFooter {
  readonly currentYear = new Date().getFullYear();

  readonly footerLinks: readonly FooterLink[] = [
    { label: 'Inicio', route: '/' },
    { label: 'Documentos', route: '/documents' },
    { label: 'Comunicados', route: '/communications' },
    { label: 'Directorio', route: '/directory' },
    { label: 'Tutoriales', route: '/tutorials' },
    { label: 'Calendario', route: '/calendar' },
  ];
}
