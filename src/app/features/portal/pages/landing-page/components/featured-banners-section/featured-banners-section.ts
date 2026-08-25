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
      lucideArrowRight,
      lucideArrowUpRight,
      lucideImageOff,
    }),
  ],
  host: { class: 'block' },
  template: `
    <section
      class="featured-banners-section overflow-hidden py-14 sm:py-16 lg:py-20"
      aria-labelledby="featured-banners-title"
    >
      <div
        class="relative mx-auto grid w-full max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[minmax(13rem,0.7fr)_minmax(0,1.8fr)] lg:items-center lg:gap-12"
      >
        <header class="max-w-xl lg:pb-12">
          <h2
            id="featured-banners-title"
            class="font-display text-3xl leading-tight tracking-[-0.025em] text-primary sm:text-4xl"
          >
            Banners destacados
          </h2>
          <p class="mt-2 max-w-3xl text-base leading-relaxed font-medium text-muted-foreground sm:text-lg">
            Conoce información y recursos relevantes para el trabajo municipal.
          </p>
        </header>

        <div class="min-w-0">
          <hlm-carousel
            #bannerCarousel
            class="w-full"
            aria-label="Carrusel de banners destacados"
            [options]="carouselOptions()"
          >
            <hlm-carousel-content class="ml-0 gap-4 sm:gap-6">
              @for (banner of items(); track banner.id) {
                <hlm-carousel-item class="pl-0">
                  <article
                    class="featured-banner group relative h-[21rem] overflow-hidden rounded-3xl text-white sm:h-[24rem] lg:h-[26rem]"
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
                      <div
                        class="image-fallback absolute inset-0 grid place-items-center"
                        aria-hidden="true"
                      >
                        <ng-icon
                          name="lucideImageOff"
                          size="3rem"
                          class="text-white/60"
                        />
                      </div>
                    }

                    <div
                      class="featured-wash absolute inset-0"
                      aria-hidden="true"
                    ></div>
                    <div
                      class="relative flex h-full max-w-2xl flex-col justify-end p-6 sm:p-8 lg:p-10"
                    >
                      <h3
                        class="font-display max-w-[20ch] text-balance text-3xl leading-[1.06] tracking-[-0.025em] sm:text-4xl"
                      >
                        {{ banner.title }}
                      </h3>
                      @if (banner.description) {
                        <p
                          class="mt-3 max-w-[58ch] text-sm leading-6 font-medium text-white/85 sm:text-base"
                        >
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
              <div
                class="mt-5 flex items-center justify-center gap-4"
                role="group"
                aria-label="Navegación de banners destacados"
              >
                <button
                  hlmCarouselPrevious
                  type="button"
                  size="icon-lg"
                  class="static size-11 translate-y-0"
                  aria-label="Mostrar banner anterior"
                ></button>

                <div class="flex items-center gap-2" aria-hidden="true">
                  @for (banner of items(); track banner.id; let index = $index) {
                    <span
                      class="banner-indicator"
                      [class.banner-indicator-active]="
                        bannerCarousel.currentSlide() === index
                      "
                    ></span>
                  }
                </div>

                <button
                  hlmCarouselNext
                  type="button"
                  size="icon-lg"
                  class="static size-11 translate-y-0"
                  aria-label="Mostrar banner siguiente"
                ></button>
              </div>
              <p class="sr-only" aria-live="polite">
                Banner {{ bannerCarousel.currentSlide() + 1 }} de
                {{ items().length }}
              </p>
            }
          </hlm-carousel>
        </div>
      </div>
    </section>
  `,
  styles: `
    .featured-banners-section {
      position: relative;
      background:
        radial-gradient(
          circle at 12% 16%,
          color-mix(in oklch, var(--landing-emerald) 16%, transparent),
          transparent 28%
        ),
        linear-gradient(
          118deg,
          color-mix(in oklch, var(--landing-emerald) 11%, var(--background)) 0%,
          color-mix(in oklch, var(--landing-teal) 14%, var(--background)) 54%,
          color-mix(in oklch, var(--landing-gold) 24%, var(--landing-cream)) 100%
        );
    }

    .featured-banners-section::before {
      position: absolute;
      bottom: -13rem;
      left: -11rem;
      width: 25rem;
      height: 25rem;
      border: 1px solid color-mix(in oklch, var(--landing-teal) 24%, transparent);
      border-radius: 9999px;
      box-shadow: 0 0 0 4.5rem
        color-mix(in oklch, var(--landing-emerald) 5%, transparent);
      content: '';
      pointer-events: none;
    }

    .featured-banners-section::after {
      position: absolute;
      top: 1.5rem;
      right: 2.5rem;
      width: 10rem;
      height: 7rem;
      background-image: radial-gradient(
        circle,
        color-mix(in oklch, var(--landing-gold) 42%, transparent) 1px,
        transparent 1.5px
      );
      background-size: 1rem 1rem;
      content: '';
      opacity: 0.55;
      pointer-events: none;
    }

    .featured-banner {
      background: var(--landing-forest);
      box-shadow: 0 28px 60px -36px
        color-mix(in oklch, var(--landing-teal) 52%, transparent);
    }

    .featured-banner-photo {
      opacity: 0.98;
      filter: saturate(0.94) contrast(1.02) brightness(1.01);
    }

    .featured-wash {
      background:
        linear-gradient(
          90deg,
          color-mix(in srgb, var(--landing-forest) 84%, transparent) 0%,
          color-mix(in srgb, var(--landing-forest) 68%, transparent) 30%,
          color-mix(in srgb, var(--landing-teal) 34%, transparent) 54%,
          color-mix(in srgb, var(--landing-teal) 8%, transparent) 74%,
          transparent 88%
        ),
        linear-gradient(0deg, rgb(3 42 29 / 0.16), transparent 55%);
    }

    .image-fallback {
      background:
        radial-gradient(circle at 78% 25%, rgb(255 255 255 / 0.13), transparent 24%),
        linear-gradient(135deg, #087a43, #06334a);
    }

    .banner-indicator {
      display: block;
      width: 0.55rem;
      height: 0.55rem;
      border: 1px solid color-mix(in oklch, var(--primary) 62%, var(--border));
      border-radius: 9999px;
      background: color-mix(in oklch, var(--primary) 18%, transparent);
    }

    .banner-indicator-active {
      background: var(--primary);
    }

    @media (max-width: 639px) {
      .featured-banners-section::after {
        display: none;
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
