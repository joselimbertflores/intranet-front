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
  lucideArrowLeft,
  lucideArrowRight,
  lucideArrowUpRight,
  lucideMegaphone,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCarouselImports } from '@spartan-ng/helm/carousel';

import { PortalCommunicationResponse } from '../../../../interfaces';

@Component({
  selector: 'landing-communications-section',
  imports: [
    DatePipe,
    HlmButtonImports,
    HlmCarouselImports,
    NgIcon,
    NgOptimizedImage,
    RouterLink,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es' },
    provideIcons({
      lucideArrowLeft,
      lucideArrowRight,
      lucideArrowUpRight,
      lucideMegaphone,
    }),
  ],
  host: { class: 'block' },
  template: `
    <section
      class="bg-card py-14 text-card-foreground sm:py-16 lg:py-20"
      aria-labelledby="communications-title"
    >
      <div class="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div class="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="communications-title"
              class="font-display text-3xl leading-tight tracking-[-0.025em] text-primary sm:text-4xl"
            >
              Comunicados recientes
            </h2>
            <p class="mt-2 max-w-3xl text-base leading-relaxed font-medium text-muted-foreground sm:text-lg">
              Mantente informado con las últimas comunicaciones institucionales.
            </p>
          </div>
          <a hlmBtn variant="link" routerLink="/communications" class="w-fit">
            Ver todos los comunicados
            <ng-icon name="lucideArrowRight" />
          </a>
        </div>

        <hlm-carousel
          #communicationsCarousel
          class="w-full"
          [options]="carouselOptions"
        >
      <hlm-carousel-content>
        @for (communication of items(); track communication.id; let index = $index) {
          <hlm-carousel-item class="basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
            <article
              class="communication-card flex min-h-96 flex-col overflow-hidden rounded-2xl border border-border bg-muted"
              [class.communication-card-sky]="index % 4 === 1"
              [class.communication-card-peach]="index % 4 === 2"
              [class.communication-card-lilac]="index % 4 === 3"
            >
              <div class="relative aspect-[4/3] overflow-hidden bg-card/65">
                @if (communication.previewUrl && !failedImages().has(communication.id)) {
                  <img
                    [ngSrc]="communication.previewUrl"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    class="object-contain p-4 transition-transform duration-300 hover:scale-[1.02] motion-reduce:transition-none motion-reduce:transform-none"
                    [alt]="'Vista previa de ' + communication.reference"
                    (error)="markImageAsFailed(communication.id)"
                  />
                } @else {
                  <div class="grid h-full place-items-center text-primary" aria-hidden="true">
                    <ng-icon name="lucideMegaphone" size="3rem" />
                  </div>
                }
              </div>

              <div class="flex flex-1 flex-col p-5">
                <div class="flex flex-wrap items-center gap-2 text-xs font-bold text-primary">
                  <span>{{ communication.typeName }}</span>
                  @if (communication.code) {
                    <span class="font-medium text-muted-foreground">{{ communication.code }}</span>
                  }
                </div>
                <h3 class="mt-3 line-clamp-3 text-lg leading-snug font-extrabold text-foreground">
                  {{ communication.reference }}
                </h3>
                <time class="mt-3 text-sm text-muted-foreground" [attr.datetime]="communication.createdAt">
                  {{ communication.createdAt | date: 'dd MMM yyyy' }}
                </time>
                <a
                  [href]="communication.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Leer comunicado
                  <ng-icon name="lucideArrowUpRight" />
                </a>
              </div>
            </article>
          </hlm-carousel-item>
        }
      </hlm-carousel-content>

      @if (communicationsCarousel.canScrollPrev() || communicationsCarousel.canScrollNext()) {
        <div class="mt-5 flex items-center justify-end gap-2">
          <button
            hlmBtn
            type="button"
            variant="outline"
            size="icon-lg"
            [disabled]="!communicationsCarousel.canScrollPrev()"
            aria-label="Mostrar comunicados anteriores"
            (click)="communicationsCarousel.scrollPrev()"
          >
            <ng-icon name="lucideArrowLeft" />
          </button>
          <button
            hlmBtn
            type="button"
            variant="outline"
            size="icon-lg"
            [disabled]="!communicationsCarousel.canScrollNext()"
            aria-label="Mostrar comunicados siguientes"
            (click)="communicationsCarousel.scrollNext()"
          >
            <ng-icon name="lucideArrowRight" />
          </button>
        </div>
      }
        </hlm-carousel>
      </div>
    </section>
  `,
  styles: `
    .communication-card {
      box-shadow: 0 18px 45px -38px color-mix(in oklch, var(--primary) 62%, transparent);
      transition:
        border-color 180ms ease,
        box-shadow 180ms ease,
        transform 180ms ease;
    }

    .communication-card-sky {
      background: var(--secondary);
    }

    .communication-card-peach {
      background: var(--accent);
    }

    .communication-card-lilac {
      background: color-mix(in oklch, var(--muted) 82%, var(--primary));
    }

    .communication-card:hover {
      border-color: color-mix(in oklch, var(--primary) 42%, var(--border));
      box-shadow: 0 24px 52px -36px color-mix(in oklch, var(--primary) 48%, transparent);
      transform: translateY(-0.2rem);
    }

    @media (prefers-reduced-motion: reduce) {
      .communication-card {
        transition: none;
      }

      .communication-card:hover {
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
