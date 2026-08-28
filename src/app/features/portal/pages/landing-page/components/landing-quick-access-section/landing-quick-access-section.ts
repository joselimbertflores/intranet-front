import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowRight } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';

import { QuickAccessCard } from '../../../../components';
import { QuickAccess } from '../../../../models';
import { LandingReveal } from '../../scroll-reveal.directive';

@Component({
  selector: 'landing-quick-access-section',
  imports: [
    HlmButtonImports,
    LandingReveal,
    NgIcon,
    QuickAccessCard,
    RouterLink,
  ],
  providers: [provideIcons({ lucideArrowRight })],
  host: { class: 'block' },
  template: `
    <section
      class="bg-card py-14 text-card-foreground sm:py-16 lg:py-20"
      aria-labelledby="quick-access-title"
    >
      <div class="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div landingReveal class="mb-8 text-center sm:mb-10">
          <h2
            id="quick-access-title"
            class="font-display text-3xl leading-tight tracking-[-0.025em] text-primary sm:text-4xl"
          >
            Accesos rápidos
          </h2>
          <p
            class="mx-auto mt-2 max-w-3xl text-base leading-relaxed font-medium text-muted-foreground sm:text-lg"
          >
            Accede a los sistemas y recursos institucionales de uso frecuente.
          </p>
        </div>

        <nav
          landingReveal
          [landingRevealDelay]="80"
          class="mx-auto grid max-w-6xl auto-rows-fr grid-cols-2 gap-4 xl:grid-cols-4"
          aria-label="Accesos rápidos"
        >
          @for (item of items(); track item.id) {
            <portal-quick-access-card [item]="item" [showDescription]="false" />
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingQuickAccessSection {
  readonly items = input.required<QuickAccess[]>();
}
