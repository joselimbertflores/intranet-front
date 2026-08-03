import { DatePipe, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  LOCALE_ID,
  input,
  signal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideArrowRight,
  lucideArrowUpRight,
  lucideMegaphone,
} from '@ng-icons/lucide';
import { HlmCarouselImports } from '@spartan-ng/helm/carousel';

import { PortalCommunicationResponse } from '../../../../interfaces';

@Component({
  selector: 'landing-communications-section',
  imports: [DatePipe, HlmCarouselImports, NgIcon, NgOptimizedImage],
  providers: [
    { provide: LOCALE_ID, useValue: 'es' },
    provideIcons({
      lucideArrowLeft,
      lucideArrowRight,
      lucideArrowUpRight,
      lucideMegaphone,
    }),
  ],
  template: `
    <hlm-carousel
      #communicationsCarousel
      class="w-full"
      [options]="carouselOptions"
    >
      <hlm-carousel-content>
        @for (communication of items(); track communication.id; let index = $index) {
          <hlm-carousel-item class="basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
            <article
              class="communication-card flex min-h-96 flex-col overflow-hidden rounded-2xl border"
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
                  <div class="grid h-full place-items-center text-5xl text-[var(--landing-green)]" aria-hidden="true">
                    <ng-icon name="lucideMegaphone" />
                  </div>
                }
              </div>

              <div class="flex flex-1 flex-col p-5">
                <div class="flex flex-wrap items-center gap-2 text-xs font-bold text-[var(--landing-green)]">
                  <span>{{ communication.typeName }}</span>
                  @if (communication.code) {
                    <span class="font-medium text-[var(--landing-muted)]">{{ communication.code }}</span>
                  }
                </div>
                <h3 class="mt-3 line-clamp-3 text-lg leading-snug font-extrabold text-[var(--landing-forest)]">
                  {{ communication.reference }}
                </h3>
                <time class="mt-3 text-sm text-[var(--landing-muted)]" [attr.datetime]="communication.createdAt">
                  {{ communication.createdAt | date: 'dd MMM yyyy' }}
                </time>
                <a
                  [href]="communication.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-[var(--landing-green)] underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[var(--landing-green)]"
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
            type="button"
            class="communication-control grid size-9 place-items-center rounded-full outline-none"
            [disabled]="!communicationsCarousel.canScrollPrev()"
            aria-label="Mostrar comunicados anteriores"
            (click)="communicationsCarousel.scrollPrev()"
          >
            <ng-icon name="lucideArrowLeft" />
          </button>
          <button
            type="button"
            class="communication-control grid size-9 place-items-center rounded-full outline-none"
            [disabled]="!communicationsCarousel.canScrollNext()"
            aria-label="Mostrar comunicados siguientes"
            (click)="communicationsCarousel.scrollNext()"
          >
            <ng-icon name="lucideArrowRight" />
          </button>
        </div>
      }
    </hlm-carousel>
  `,
  styles: `
    :host {
      display: block;
    }

    .communication-card {
      border-color: rgb(6 63 43 / 0.12);
      background: var(--landing-mint);
      box-shadow: 0 18px 45px -38px rgb(6 63 43 / 0.62);
      transition:
        border-color 180ms ease,
        box-shadow 180ms ease,
        transform 180ms ease;
    }

    .communication-card-sky {
      background: var(--landing-sky);
      border-color: rgb(21 90 163 / 0.18);
    }

    .communication-card-peach {
      background: var(--landing-peach);
      border-color: rgb(194 93 10 / 0.18);
    }

    .communication-card-lilac {
      background: var(--landing-lilac);
      border-color: rgb(112 38 165 / 0.16);
    }

    .communication-card:hover {
      border-color: rgb(8 122 67 / 0.42);
      box-shadow: 0 24px 52px -36px rgb(6 63 43 / 0.48);
      transform: translateY(-0.2rem);
    }

    .communication-control {
      border: 1px solid var(--landing-line);
      background: white;
      color: var(--landing-green);
      transition:
        border-color 160ms ease,
        background-color 160ms ease;
    }

    .communication-control:hover:not(:disabled) {
      border-color: color-mix(in srgb, var(--landing-green) 45%, transparent);
      background: var(--landing-mint);
    }

    .communication-control:focus-visible {
      outline: 2px solid var(--landing-green);
      outline-offset: 2px;
    }

    .communication-control:disabled {
      cursor: not-allowed;
      opacity: 0.35;
    }

    @media (prefers-reduced-motion: reduce) {
      .communication-card,
      .communication-control {
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
