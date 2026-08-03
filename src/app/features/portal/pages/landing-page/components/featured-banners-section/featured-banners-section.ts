import { NgOptimizedImage } from '@angular/common';
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
    NgOptimizedImage,
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
  template: `
    <hlm-carousel
      #bannerCarousel
      class="mt-9 w-full sm:mt-10"
      [options]="carouselOptions()"
    >
      <hlm-carousel-content class="-ml-0">
        @for (banner of items(); track banner.id) {
          <hlm-carousel-item class="pl-0">
            <article
              class="featured-banner group relative min-h-[21rem] overflow-hidden rounded-3xl bg-[var(--landing-forest)] text-white sm:min-h-[23rem] lg:min-h-[25rem]"
            >
              @if (!failedImages().has(banner.id)) {
                <img
                  [ngSrc]="banner.imageUrl"
                  fill
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  class="featured-banner-photo object-cover transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:transform-none"
                  [alt]="banner.title"
                  (error)="markImageAsFailed(banner.id)"
                />
              } @else {
                <div class="image-fallback absolute inset-0 grid place-items-center" aria-hidden="true">
                  <ng-icon name="lucideImageOff" class="text-5xl text-white/60" />
                </div>
              }

              <div class="featured-wash absolute inset-0" aria-hidden="true"></div>
              <div class="relative flex min-h-[21rem] max-w-2xl flex-col justify-end p-6 sm:min-h-[23rem] sm:p-8 lg:min-h-[25rem] lg:p-10">
                <h3 class="max-w-[20ch] text-balance text-3xl leading-[1.06] font-black tracking-[-0.025em] sm:text-4xl">
                  {{ banner.title }}
                </h3>
                @if (banner.description) {
                  <p class="mt-3 max-w-[58ch] text-sm leading-6 text-white/85 sm:text-base">
                    {{ banner.description }}
                  </p>
                }
                @if (banner.linkLabel && validUrl(banner.linkUrl); as url) {
                  <div class="mt-5">
                    @if (isInternalUrl(url)) {
                      <a hlmBtn variant="secondary" [routerLink]="url" class="w-fit">
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
                        class="w-fit"
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
  `,
  styles: `
    :host {
      display: block;
    }

    .featured-banner {
      box-shadow: 0 24px 56px -38px rgb(6 63 43 / 0.58);
    }

    .featured-banner-photo {
      opacity: 0.98;
      filter: saturate(0.94) contrast(1.02) brightness(1.01);
    }

    .featured-wash {
      background:
        linear-gradient(90deg, rgb(5 39 52 / 0.62) 0%, rgb(5 45 57 / 0.38) 36%, rgb(5 45 57 / 0.08) 68%, transparent 100%),
        linear-gradient(0deg, rgb(4 29 39 / 0.2), transparent 52%);
    }

    .image-fallback {
      background:
        radial-gradient(circle at 78% 25%, rgb(255 255 255 / 0.13), transparent 24%),
        linear-gradient(135deg, var(--landing-green), var(--landing-navy));
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
