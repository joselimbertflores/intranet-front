import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowRight } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';

import {
  QUICK_ACCESS_ICON_REGISTRY,
  quickAccessIconName,
} from '../../../../constants/quick-access-icons';
import { QuickAccess, QuickAccessIconKey } from '../../../../models';

@Component({
  selector: 'landing-quick-access-section',
  imports: [HlmButtonImports, NgIcon, RouterLink],
  providers: [
    provideIcons({ lucideArrowRight, ...QUICK_ACCESS_ICON_REGISTRY }),
  ],
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
            class="font-display text-3xl leading-tight tracking-[-0.025em] text-foreground sm:text-4xl"
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
              class="quick-access-card group flex min-h-28 flex-col items-center justify-center gap-3 rounded-2xl border px-3 py-5 text-center no-underline outline-none sm:min-h-32"
              [style.--quick-access-color]="item.backgroundColor"
              [attr.aria-label]="'Abrir ' + item.title + ' en una nueva pestaña'"
            >
              <span class="quick-access-icon grid size-12 place-items-center text-6xl" aria-hidden="true">
                <ng-icon [name]="quickAccessIcon(item.iconKey)" />
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
      --quick-access-color: var(--primary);

      flex: 0 1 13.25rem;
      border-color: color-mix(in srgb, var(--quick-access-color) 26%, white);
      background: color-mix(in srgb, var(--quick-access-color) 12%, white);
      color: color-mix(in srgb, var(--quick-access-color) 82%, black);
      box-shadow: 0 12px 30px -28px color-mix(in srgb, var(--quick-access-color) 65%, transparent);
      transition:
        border-color 180ms ease,
        box-shadow 180ms ease,
        transform 180ms ease;
    }

    .quick-access-card:hover {
      border-color: color-mix(in srgb, var(--quick-access-color) 48%, white);
      background: color-mix(in srgb, var(--quick-access-color) 16%, white);
      box-shadow: 0 18px 36px -28px color-mix(in srgb, var(--quick-access-color) 78%, transparent);
      transform: translateY(-0.2rem);
    }

    .quick-access-card:focus-visible {
      outline: 3px solid color-mix(in srgb, var(--quick-access-color) 72%, black);
      outline-offset: 3px;
    }

    .quick-access-icon {
      color: color-mix(in srgb, var(--quick-access-color) 88%, black);
    }

    :host-context(.dark) .quick-access-card {
      border-color: color-mix(in oklch, var(--quick-access-color) 42%, var(--border));
      background: color-mix(in oklch, var(--quick-access-color) 20%, var(--card));
      color: color-mix(in oklch, var(--quick-access-color) 68%, var(--foreground));
      box-shadow: 0 12px 30px -28px color-mix(in oklch, var(--quick-access-color) 70%, transparent);
    }

    :host-context(.dark) .quick-access-card:hover {
      border-color: color-mix(in oklch, var(--quick-access-color) 58%, var(--border));
      background: color-mix(in oklch, var(--quick-access-color) 28%, var(--card));
      box-shadow: 0 18px 36px -28px color-mix(in oklch, var(--quick-access-color) 82%, transparent);
    }

    :host-context(.dark) .quick-access-card:focus-visible {
      outline-color: color-mix(in oklch, var(--quick-access-color) 70%, var(--foreground));
    }

    :host-context(.dark) .quick-access-icon {
      color: color-mix(in oklch, var(--quick-access-color) 78%, var(--foreground));
    }

    @media (max-width: 479px) {
      .quick-access-card {
        flex-basis: calc(50% - 0.375rem);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .quick-access-card {
        transition: none;
      }

      .quick-access-card:hover {
        transform: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingQuickAccessSection {
  readonly items = input.required<QuickAccess[]>();

  quickAccessIcon(iconKey: QuickAccessIconKey): string {
    return quickAccessIconName(iconKey);
  }
}
