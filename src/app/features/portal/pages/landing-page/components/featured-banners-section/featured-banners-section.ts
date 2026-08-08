import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideArrowRight,
  lucideArrowUpRight,
  lucideImageOff,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCarouselImports } from '@spartan-ng/helm/carousel';

import { FeaturedBanner } from '../../../../models';

@Component({
  selector: 'featured-banners-section',
  imports: [
    HlmButtonImports,
    HlmCarouselImports,
    NgIcon,
    RouterLink,
  ],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideArrowRight,
      lucideArrowUpRight,
      lucideImageOff,
    }),
  ],
  host: { class: 'block' },
  template: `
    <section
      class="bg-muted/60 py-14 sm:py-16 lg:py-20"
      aria-labelledby="featured-banners-title"
    >
      <div class="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div class="mb-8 sm:mb-10">
          <h2
            id="featured-banners-title"
            class="font-display text-3xl leading-tight tracking-[-0.025em] text-primary sm:text-4xl"
          >
            Banners destacados
          </h2>
          <p class="mt-2 max-w-3xl text-base leading-relaxed font-medium text-muted-foreground sm:text-lg">
            Conoce información y recursos relevantes para el trabajo municipal.
          </p>
        </div>

        <hlm-carousel
          #bannerCarousel
          class="w-full"
          [options]="carouselOptions()"
        >
      <hlm-carousel-content class="ml-0 gap-4 sm:gap-6">
        @for (banner of items(); track banner.id) {
          <hlm-carousel-item class="pl-0">
            <article
              class="featured-banner group relative h-[22rem] overflow-hidden rounded-3xl text-white sm:h-[24rem] lg:h-[26rem]"
            >
              @if (!failedImages().has(banner.id)) {
                <img
                  [src]="banner.imageUrl"
                  loading="lazy"
                  decoding="async"
                  class="featured-banner-photo absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:transform-none"
                  [alt]="banner.title"
                  (error)="markImageAsFailed(banner.id)"
                />
              } @else {
                <div class="image-fallback absolute inset-0 grid place-items-center" aria-hidden="true">
                  <ng-icon name="lucideImageOff" size="3rem" class="text-white/60" />
                </div>
              }

              <div class="featured-wash absolute inset-0" aria-hidden="true"></div>
              <div class="relative flex h-full max-w-2xl flex-col justify-end p-6 sm:p-8 lg:p-10">
                <h3 class="font-display max-w-[20ch] text-balance text-3xl leading-[1.06] tracking-[-0.025em] sm:text-4xl">
                  {{ banner.title }}
                </h3>
                @if (banner.description) {
                  <p class="mt-3 max-w-[58ch] text-sm leading-6 font-medium text-white/85 sm:text-base">
                    {{ banner.description }}
                  </p>
                }
                @if (banner.linkLabel && validUrl(banner.linkUrl); as url) {
                  <div class="mt-5">
                    @if (isInternalUrl(url)) {
                      <a hlmBtn variant="secondary" [routerLink]="url">
                        {{ banner.linkLabel }}
                        <ng-icon name="lucideArrowRight" />
                      </a>
                    } @else {
                      <a
                        hlmBtn
                        variant="secondary"
                        [href]="url"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {{ banner.linkLabel }}
                        <ng-icon name="lucideArrowUpRight" />
                      </a>
                    }
                  </div>
                }
              </div>
            </article>
          </hlm-carousel-item>
        }
      </hlm-carousel-content>

      @if (hasMultipleItems()) {
        <button
          type="button"
          class="banner-control absolute top-1/2 left-3 grid size-8 -translate-y-1/2 place-items-center rounded-full outline-none sm:left-5 sm:size-9"
          aria-label="Mostrar banner anterior"
          (click)="bannerCarousel.scrollPrev()"
        >
          <ng-icon name="lucideArrowLeft" />
        </button>
        <button
          type="button"
          class="banner-control absolute top-1/2 right-3 grid size-8 -translate-y-1/2 place-items-center rounded-full outline-none sm:right-5 sm:size-9"
          aria-label="Mostrar banner siguiente"
          (click)="bannerCarousel.scrollNext()"
        >
          <ng-icon name="lucideArrowRight" />
        </button>

        <div class="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2" aria-hidden="true">
          @for (banner of items(); track banner.id; let index = $index) {
            <span
              class="banner-indicator"
              [class.banner-indicator-active]="bannerCarousel.currentSlide() === index"
            ></span>
          }
        </div>
        <p class="sr-only" aria-live="polite">
          Banner {{ bannerCarousel.currentSlide() + 1 }} de {{ items().length }}
        </p>
      }
        </hlm-carousel>
      </div>
    </section>
  `,
  styles: `
    .featured-banner {
      background: var(--primary);
      box-shadow: 0 24px 56px -38px color-mix(in oklch, var(--primary) 58%, transparent);
    }

    .featured-banner-photo {
      opacity: 0.98;
      filter: saturate(0.94) contrast(1.02) brightness(1.01);
    }

    .featured-wash {
      background:
        linear-gradient(
          90deg,
          rgb(3 54 36 / 0.8) 0%,
          rgb(4 63 42 / 0.66) 30%,
          rgb(4 63 42 / 0.3) 52%,
          rgb(4 63 42 / 0.07) 72%,
          transparent 88%
        ),
        linear-gradient(0deg, rgb(3 42 29 / 0.16), transparent 55%);
    }

    .image-fallback {
      background:
        radial-gradient(circle at 78% 25%, rgb(255 255 255 / 0.13), transparent 24%),
        linear-gradient(135deg, #087a43, #06334a);
    }

    .banner-control {
      border: 1px solid rgb(255 255 255 / 0.25);
      background: rgb(3 28 20 / 0.38);
      color: rgb(255 255 255 / 0.92);
      box-shadow: 0 5px 16px rgb(2 15 10 / 0.14);
      backdrop-filter: blur(5px);
      transition:
        background-color 160ms ease,
        border-color 160ms ease;
    }

    .banner-control:hover {
      border-color: rgb(255 255 255 / 0.48);
      background: rgb(3 28 20 / 0.62);
    }

    .banner-control:focus-visible {
      outline: 2px solid white;
      outline-offset: 3px;
    }

    .banner-indicator {
      display: block;
      width: 0.5rem;
      height: 0.5rem;
      border: 1px solid rgb(255 255 255 / 0.82);
      border-radius: 9999px;
      background: rgb(255 255 255 / 0.3);
    }

    .banner-indicator-active {
      background: white;
    }

    @media (prefers-reduced-motion: reduce) {
      .banner-control {
        transition: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturedBannersSection {
  readonly items = input.required<FeaturedBanner[]>();
  readonly failedImages = signal<ReadonlySet<number>>(new Set());
  readonly hasMultipleItems = computed(() => this.items().length > 1);
  readonly carouselOptions = computed(() => ({
    loop: this.hasMultipleItems(),
    align: 'start' as const,
  }));

  markImageAsFailed(id: number): void {
    this.failedImages.update((failed) => new Set(failed).add(id));
  }

  isInternalUrl(url: string): boolean {
    return url.startsWith('/');
  }

  validUrl(url: string | null): string | null {
    if (!url) return null;
    return this.isInternalUrl(url) || /^https?:\/\//i.test(url) ? url : null;
  }
}
