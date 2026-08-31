import { DatePipe, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  LOCALE_ID,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideArrowUpRight,
  lucideMegaphone,
} from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCarouselImports } from '@spartan-ng/helm/carousel';

import { PortalCommunicationResponse } from '../../../../interfaces';
import { LandingReveal } from '../../scroll-reveal.directive';

@Component({
  selector: 'landing-communications-section',
  imports: [
    DatePipe,
    HlmBadgeImports,
    HlmButtonImports,
    HlmCarouselImports,
    LandingReveal,
    NgIcon,
    NgOptimizedImage,
    RouterLink,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es' },
    provideIcons({
      lucideArrowRight,
      lucideArrowUpRight,
      lucideMegaphone,
    }),
  ],
  host: { class: 'block' },
  template: `
    <section
      class="communications-section py-14 text-card-foreground sm:py-16 lg:py-20"
      aria-labelledby="communications-title"
    >
      <div class="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div landingReveal class="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="communications-title"
              class="text-3xl leading-tight font-bold tracking-[-0.025em] text-primary sm:text-4xl"
            >
              Comunicados recientes
            </h2>
            <p class="mt-2 max-w-3xl text-base leading-relaxed font-medium text-muted-foreground sm:text-lg">
              Mantente informado con las últimas comunicaciones institucionales.
            </p>
          </div>
          <a hlmBtn variant="link" routerLink="/comunicados" class="w-fit">
            Ver todos los comunicados
            <ng-icon name="lucideArrowRight" data-icon="inline-end" />
          </a>
        </div>

        <hlm-carousel
          #communicationsCarousel
          landingReveal
          [landingRevealDelay]="80"
          class="w-full"
          aria-label="Carrusel de comunicados recientes"
          [options]="carouselOptions"
        >
      <hlm-carousel-content class="pt-3 pb-8">
        @for (communication of items(); track communication.id) {
          <hlm-carousel-item class="basis-full sm:basis-1/2 lg:basis-1/3">
            <article class="h-full">
              <a
                class="communication-card group flex h-full min-h-96 flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring"
                [href]="communication.url"
                target="_blank"
                rel="noopener noreferrer"
                [attr.aria-label]="'Abrir comunicado ' + communication.reference + ' en una nueva pestaña'"
              >
              <div class="communication-media relative aspect-[4/3] overflow-hidden bg-muted/55">
                @if (communication.previewUrl && !failedImages().has(communication.id)) {
                  <img
                    [ngSrc]="communication.previewUrl"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    class="communication-image object-contain p-4"
                    [alt]="'Vista previa de ' + communication.reference"
                    (error)="markImageAsFailed(communication.id)"
                  />
                } @else {
                  <div class="communication-fallback grid h-full place-items-center text-primary" aria-hidden="true">
                    <ng-icon name="lucideMegaphone" size="3rem" />
                  </div>
                }
              </div>

              <div class="flex flex-1 flex-col p-5">
                <div class="flex flex-wrap items-center gap-2 text-xs">
                  <span hlmBadge variant="secondary">
                    {{ communication.typeName }}
                  </span>
                  @if (communication.code) {
                    <span class="font-medium text-muted-foreground">{{ communication.code }}</span>
                  }
                </div>
                <h3 class="communication-title mt-3 line-clamp-3 text-lg leading-snug font-semibold text-foreground">
                  {{ communication.reference }}
                </h3>
                <time class="mt-3 text-sm text-muted-foreground" [attr.datetime]="communication.createdAt">
                  {{ communication.createdAt | date: 'dd MMM yyyy' }}
                </time>
                <span
                  class="communication-link-indicator mt-auto grid size-10 place-items-center self-end rounded-full bg-secondary text-secondary-foreground"
                  aria-hidden="true"
                >
                  <ng-icon name="lucideArrowUpRight" />
                </span>
              </div>
              </a>
            </article>
          </hlm-carousel-item>
        }
      </hlm-carousel-content>

      @if (communicationsCarousel.canScrollPrev() || communicationsCarousel.canScrollNext()) {
        <div
          class="mt-5 flex items-center justify-end gap-2"
          role="group"
          aria-label="Navegación de comunicados recientes"
        >
          <button
            hlmCarouselPrevious
            type="button"
            size="icon-lg"
            class="static size-11 translate-y-0"
            aria-label="Mostrar comunicados anteriores"
          ></button>
          <button
            hlmCarouselNext
            type="button"
            size="icon-lg"
            class="static size-11 translate-y-0"
            aria-label="Mostrar comunicados siguientes"
          ></button>
        </div>
      }
        </hlm-carousel>
      </div>
    </section>
  `,
  styles: `
    .communications-section {
      background:
        radial-gradient(
          ellipse at 86% 8%,
          color-mix(in srgb, var(--landing-sand) 54%, transparent) 0%,
          transparent 34%
        ),
        linear-gradient(
          116deg,
          color-mix(in srgb, var(--landing-cream) 82%, var(--background)) 0%,
          color-mix(in srgb, var(--landing-sand) 38%, var(--background)) 100%
        );
    }

    .communication-card {
      position: relative;
      background: var(--card);
      box-shadow:
        0 4px 10px -6px
          color-mix(in srgb, var(--foreground) 24%, transparent),
        0 1.2rem 2.75rem -1.8rem
          color-mix(in oklch, var(--primary) 36%, transparent);
      transition:
        background-color 220ms ease,
        border-color 280ms ease,
        box-shadow 340ms cubic-bezier(0.16, 1, 0.3, 1),
        transform 340ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    .communication-card::after {
      position: absolute;
      inset: auto 0 0;
      height: 0.3rem;
      background: linear-gradient(
        90deg,
        var(--primary),
        var(--landing-teal)
      );
      content: '';
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 360ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    .communication-media,
    .communication-image,
    .communication-fallback,
    .communication-title,
    .communication-link-indicator {
      transition-duration: 320ms;
      transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
    }

    .communication-media {
      transition-property: background-color;
    }

    .communication-image,
    .communication-fallback {
      transition-property: transform;
    }

    .communication-title {
      transition-property: color;
    }

    .communication-link-indicator {
      transition-property: background-color, color, transform;
    }

    .communication-card:is(:hover, :focus-visible) {
      border-color: color-mix(in oklch, var(--primary) 48%, var(--border));
      background: color-mix(in srgb, var(--primary) 7%, var(--card));
      box-shadow:
        0 12px 24px -12px
          color-mix(in srgb, var(--foreground) 34%, transparent),
        0 2rem 3.75rem -1.55rem
          color-mix(in oklch, var(--primary) 58%, transparent);
      transform: translateY(-0.5rem);
    }

    .communication-card:is(:hover, :focus-visible)::after {
      transform: scaleX(1);
    }

    .communication-card:is(:hover, :focus-visible) .communication-media {
      background: color-mix(in srgb, var(--primary) 13%, var(--muted));
    }

    .communication-card:is(:hover, :focus-visible) .communication-image {
      transform: scale(1.075);
    }

    .communication-card:is(:hover, :focus-visible) .communication-fallback {
      transform: scale(1.08);
    }

    .communication-card:is(:hover, :focus-visible) .communication-title {
      color: var(--primary);
    }

    .communication-card:is(:hover, :focus-visible)
      .communication-link-indicator {
      background: var(--primary);
      color: var(--primary-foreground);
      transform: translate(0.15rem, -0.15rem);
    }

    @media (prefers-reduced-motion: reduce) {
      .communication-card,
      .communication-card::after,
      .communication-media,
      .communication-image,
      .communication-fallback,
      .communication-title,
      .communication-link-indicator {
        transition: none;
      }

      .communication-card:is(:hover, :focus-visible),
      .communication-card:is(:hover, :focus-visible) .communication-image,
      .communication-card:is(:hover, :focus-visible) .communication-fallback,
      .communication-card:is(:hover, :focus-visible)
        .communication-link-indicator {
        transform: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingCommunicationsSection {
  readonly items = input.required<PortalCommunicationResponse[]>();
  readonly failedImages = signal<ReadonlySet<string>>(new Set());
  readonly carouselOptions = {
    align: 'start' as const,
    containScroll: 'trimSnaps' as const,
    loop: false,
  };

  markImageAsFailed(id: string): void {
    this.failedImages.update((failed) => new Set(failed).add(id));
  }
}
