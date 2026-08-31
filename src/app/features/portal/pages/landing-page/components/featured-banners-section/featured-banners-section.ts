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
import { HlmCarouselImports } from '@spartan-ng/helm/carousel';

import { FeaturedBanner } from '../../../../models';
import { LandingReveal } from '../../scroll-reveal.directive';

@Component({
  selector: 'featured-banners-section',
  imports: [
    HlmCarouselImports,
    LandingReveal,
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
        class="featured-banners-shell relative mx-auto grid w-full max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[minmax(13rem,0.7fr)_minmax(0,1.8fr)] lg:items-center lg:gap-12"
      >
        <header landingReveal class="max-w-xl lg:pb-12">
          <h2
            id="featured-banners-title"
            class="text-3xl leading-tight font-bold tracking-[-0.025em] text-primary sm:text-4xl"
          >
            Información destacada
          </h2>
          <p
            class="mt-2 max-w-3xl text-base leading-relaxed font-medium text-muted-foreground sm:text-lg"
          >
            Accede a información y recursos relevantes para el trabajo
            municipal.
          </p>
        </header>

        <div landingReveal [landingRevealDelay]="80" class="min-w-0">
          <hlm-carousel
            #bannerCarousel
            class="w-full [&>div[emblacarousel]]:px-6 [&>div[emblacarousel]]:pt-10 [&>div[emblacarousel]]:pb-12 sm:[&>div[emblacarousel]]:px-8 lg:[&>div[emblacarousel]]:px-10"
            aria-label="Carrusel de banners destacados"
            [options]="carouselOptions()"
          >
            <hlm-carousel-content class="sm:-ml-6">
              @for (banner of items(); track banner.id) {
                <hlm-carousel-item class="sm:pl-6">
                  <article
                    class="featured-banner group relative h-[21rem] overflow-hidden rounded-3xl text-white sm:h-[24rem] lg:h-[26rem]"
                    [class.featured-banner-interactive]="banner.linkLabel && validUrl(banner.linkUrl)"
                  >
                    @if (!failedImages().has(banner.id)) {
                      <img
                        [src]="banner.imageUrl"
                        loading="lazy"
                        decoding="async"
                        class="featured-banner-photo absolute inset-0 size-full object-cover"
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
                      class="featured-banner-copy relative flex h-full max-w-2xl flex-col justify-end p-6 sm:p-8 lg:p-10"
                    >
                      <h3
                        class="max-w-[20ch] text-balance text-3xl leading-[1.06] font-bold tracking-[-0.025em] sm:text-4xl"
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
                      @if (
                        banner.linkLabel && validUrl(banner.linkUrl);
                        as url
                      ) {
                        <div class="mt-5">
                          <span class="featured-banner-action inline-flex h-10 items-center gap-2 rounded-md bg-white/94 px-4 text-sm font-semibold text-(--landing-forest) shadow-sm">
                            {{ banner.linkLabel }}
                            <ng-icon
                              [name]="isInternalUrl(url) ? 'lucideArrowRight' : 'lucideArrowUpRight'"
                              aria-hidden="true"
                            />
                          </span>
                        </div>
                      }
                    </div>

                    @if (banner.linkLabel && validUrl(banner.linkUrl); as url) {
                      @if (isInternalUrl(url)) {
                        <a
                          class="featured-banner-link absolute inset-0 z-10 rounded-3xl outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-white"
                          [routerLink]="url"
                          [attr.aria-label]="banner.linkLabel + ': ' + banner.title"
                        ></a>
                      } @else {
                        <a
                          class="featured-banner-link absolute inset-0 z-10 rounded-3xl outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-white"
                          [href]="url"
                          target="_blank"
                          rel="noopener noreferrer"
                          [attr.aria-label]="banner.linkLabel + ': ' + banner.title + ' (abre en una nueva pestaña)'"
                        ></a>
                      }
                    }
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
                  @for (
                    banner of items();
                    track banner.id;
                    let index = $index
                  ) {
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
      isolation: isolate;
      background:
        radial-gradient(
          ellipse at 13% 12%,
          color-mix(in srgb, var(--primary) 13%, transparent) 0%,
          transparent 31%
        ),
        radial-gradient(
          ellipse at 88% 92%,
          color-mix(in srgb, var(--landing-teal) 11%, transparent) 0%,
          transparent 30%
        ),
        linear-gradient(
          118deg,
          color-mix(in srgb, var(--primary) 10%, var(--background)) 0%,
          color-mix(in srgb, var(--portal-mint) 58%, var(--background)) 48%,
          color-mix(in srgb, var(--landing-teal) 9%, var(--background)) 100%
        );
    }

    .featured-banners-section::before,
    .featured-banners-section::after {
      position: absolute;
      z-index: -1;
      border: 1px solid
        color-mix(in srgb, var(--primary) 22%, transparent);
      border-radius: 50%;
      content: '';
      pointer-events: none;
    }

    .featured-banners-section::before {
      bottom: -25rem;
      left: -14rem;
      width: 38rem;
      height: 38rem;
      box-shadow:
        0 0 0 4.5rem
          color-mix(in srgb, var(--primary) 5%, transparent),
        0 0 0 9rem
          color-mix(in srgb, var(--landing-teal) 3%, transparent);
    }

    .featured-banners-section::after {
      top: -17rem;
      right: -12rem;
      width: 31rem;
      height: 25rem;
      border-color: color-mix(
        in srgb,
        var(--landing-teal) 20%,
        transparent
      );
      transform: rotate(-12deg);
    }

    .featured-banners-shell {
      z-index: 1;
    }

    .featured-banner {
      background: var(--landing-forest);
      box-shadow:
        0 8px 18px -12px rgb(2 31 23 / 0.48),
        0 1.75rem 3.75rem -2rem
          color-mix(in oklch, var(--landing-teal) 58%, transparent);
      transition:
        box-shadow 420ms cubic-bezier(0.16, 1, 0.3, 1),
        transform 420ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    .featured-banner-photo {
      transition:
        filter 520ms ease,
        transform 720ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    .featured-banner-copy,
    .featured-banner-action {
      transition-duration: 400ms;
      transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
    }

    .featured-banner-copy {
      transition-property: transform;
    }

    .featured-banner-action {
      transition-property: background-color, box-shadow, transform;
    }

    .featured-banner-interactive:is(:hover, :focus-within) {
      box-shadow:
        0 16px 30px -15px rgb(2 31 23 / 0.64),
        0 2.4rem 4.5rem -1.7rem
          color-mix(in oklch, var(--landing-teal) 82%, transparent);
      transform: translateY(-0.3rem) scale(1.006);
    }

    .featured-banner-interactive:is(:hover, :focus-within)
      .featured-banner-photo {
      filter: saturate(1.08) contrast(1.07) brightness(0.92);
      transform: scale(1.085);
    }

    .featured-banner-interactive:is(:hover, :focus-within)
      .featured-banner-copy {
      transform: translateY(-0.3rem);
    }

    .featured-banner-interactive:is(:hover, :focus-within)
      .featured-banner-action {
      background: white;
      box-shadow: 0 0.75rem 1.8rem -0.9rem rgb(2 31 23 / 0.68);
      transform: translateX(0.25rem);
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
      background: linear-gradient(135deg, #087a43, #06334a);
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

    @media (prefers-reduced-motion: reduce) {
      .featured-banner,
      .featured-banner-photo,
      .featured-banner-copy,
      .featured-banner-action {
        transition: none;
      }

      .featured-banner-interactive:is(:hover, :focus-within),
      .featured-banner-interactive:is(:hover, :focus-within)
        .featured-banner-photo,
      .featured-banner-interactive:is(:hover, :focus-within)
        .featured-banner-copy,
      .featured-banner-interactive:is(:hover, :focus-within)
        .featured-banner-action {
        transform: none;
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
