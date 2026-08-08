import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowRight } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';

import { QUICK_ACCESS_ICONS } from '../../../../../../shared/constants/quick-access-icons';
import { QuickAccess } from '../../../../models';

@Component({
  selector: 'landing-quick-access-section',
  imports: [HlmButtonImports, NgIcon, RouterLink],
  providers: [provideIcons({ lucideArrowRight, ...QUICK_ACCESS_ICONS })],
  host: { class: 'block' },
  template: `
    <section
      class="bg-card py-14 text-card-foreground sm:py-16 lg:py-20"
      aria-labelledby="quick-access-title"
    >
      <div class="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div class="mb-8 text-center sm:mb-10">
          <h2
            id="quick-access-title"
            class="font-display text-3xl leading-tight tracking-[-0.025em] text-primary sm:text-4xl"
          >
            Accesos rápidos
          </h2>
          <p class="mx-auto mt-2 max-w-3xl text-base leading-relaxed font-medium text-muted-foreground sm:text-lg">
            Accede a los sistemas y recursos institucionales de uso frecuente.
          </p>
        </div>

        <nav class="flex flex-wrap justify-center gap-3 sm:gap-4" aria-label="Accesos rápidos">
          @for (item of items(); track item.id) {
            <a
              [href]="item.url"
              target="_blank"
              rel="noopener noreferrer"
              class="quick-access-card quick-access-surface flex min-h-28 flex-col items-center justify-center gap-3 rounded-2xl border px-3 py-5 text-center no-underline outline-none sm:min-h-32"
              [style.--quick-access-color]="item.backgroundColor"
              [attr.aria-label]="'Abrir ' + item.title + ' en una nueva pestaña'"
            >
              <span class="quick-access-identity grid size-12 place-items-center" aria-hidden="true">
                <ng-icon [name]="item.iconKey" size="3rem" />
              </span>
              <span class="line-clamp-2 text-sm leading-snug font-extrabold sm:text-base">
                {{ item.title }}
              </span>
            </a>
          }
        </nav>

        <div class="mt-8 text-center">
          <a hlmBtn variant="outline" routerLink="/accesos">
            Ver todos los accesos
            <ng-icon name="lucideArrowRight" data-icon="inline-end" />
          </a>
        </div>
      </div>
    </section>
  `,
  styles: `
    .quick-access-card {
      flex: 0 1 13.25rem;
    }

    @media (max-width: 479px) {
      .quick-access-card {
        flex-basis: calc(50% - 0.375rem);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingQuickAccessSection {
  readonly items = input.required<QuickAccess[]>();
}
