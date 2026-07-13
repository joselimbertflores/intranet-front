import {
  ChangeDetectionStrategy,
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import type { Swiper } from 'swiper';
import { register } from 'swiper/element/bundle';

import { FeaturedBanner } from '../../../../models';

register();

@Component({
  selector: 'featured-banners-section',
  imports: [RouterLink],
  template: `
    <section
      class="w-full bg-[var(--portal-mint)] py-14 sm:py-16 lg:py-20"
      aria-labelledby="featured-banners-title"
    >
      <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <header class="mb-7 flex items-end justify-between gap-5">
          <h2
            id="featured-banners-title"
            class="text-3xl font-extrabold tracking-[-0.025em] text-primary-900 sm:text-4xl"
          >
            Avisos destacados
          </h2>

          @if (hasMultipleItems()) {
            <div class="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                class="featured-nav-button"
                aria-label="Mostrar aviso anterior"
                [disabled]="activeIndex() === 0"
                (click)="previousSlide(featuredSwiper)"
              >
                <i class="pi pi-arrow-left" aria-hidden="true"></i>
              </button>
              <button
                type="button"
                class="featured-nav-button"
                aria-label="Mostrar aviso siguiente"
                [disabled]="activeIndex() === items().length - 1"
                (click)="nextSlide(featuredSwiper)"
              >
                <i class="pi pi-arrow-right" aria-hidden="true"></i>
              </button>
            </div>
          }
        </header>

        <swiper-container
          #featuredSwiper
          class="featured-carousel block"
          slides-per-view="1"
          space-between="0"
          keyboard="true"
          a11y="true"
          (swiperslidechange)="onSlideChange($event)"
        >
          @for (banner of items(); track banner.id) {
            <swiper-slide>
              <article class="featured-card relative h-full overflow-hidden rounded-[1.5rem] bg-primary-950 text-white shadow-xl shadow-primary-950/15 ring-1 ring-primary-950/10 sm:rounded-[1.75rem]">
                <div class="featured-image-panel bg-linear-to-br from-primary-800 to-primary-950">
                  @if (!failedImages().has(banner.id)) {
                    <img
                      [src]="banner.imageUrl"
                      [alt]="banner.title || ''"
                      class="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                      (error)="markImageAsFailed(banner.id)"
                    />
                  } @else {
                    <div class="grid h-full place-items-center text-primary-200/70" aria-hidden="true">
                      <i class="pi pi-image text-4xl"></i>
                    </div>
                  }
                </div>

                <div class="featured-content relative z-10 flex h-full flex-col justify-center p-6 sm:p-8 lg:px-12 lg:py-10">
                  <h3 class="max-w-xl text-balance text-3xl font-extrabold leading-[1.08] tracking-[-0.03em] sm:text-4xl">
                    {{ banner.title }}
                  </h3>

                  @if (banner.description) {
                    <p class="mt-4 max-w-lg text-pretty text-sm leading-6 text-primary-100/85 sm:text-base sm:leading-7">
                      {{ banner.description }}
                    </p>
                  }

                  @if (banner.linkLabel && validUrl(banner.url); as url) {
                    <div class="mt-6">
                      @if (isInternalUrl(url)) {
                        <a
                          [routerLink]="url"
                          class="featured-link inline-flex min-h-11 items-center gap-3 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-primary-900 no-underline outline-none transition-colors hover:bg-primary-50 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-primary-950"
                        >
                          {{ banner.linkLabel }}
                          <i class="pi pi-arrow-right text-xs" aria-hidden="true"></i>
                        </a>
                      } @else {
                        <a
                          [href]="url"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="featured-link inline-flex min-h-11 items-center gap-3 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-primary-900 no-underline outline-none transition-colors hover:bg-primary-50 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-primary-950"
                        >
                          {{ banner.linkLabel }}
                          <i class="pi pi-arrow-up-right text-xs" aria-hidden="true"></i>
                        </a>
                      }
                    </div>
                  }
                </div>
              </article>
            </swiper-slide>
          }
        </swiper-container>

        @if (hasMultipleItems()) {
          <div class="mt-5 flex items-center justify-center gap-2" aria-label="Seleccionar aviso destacado">
            @for (banner of items(); track banner.id; let index = $index) {
              <button
                type="button"
                class="featured-dot"
                [class.featured-dot-active]="activeIndex() === index"
                [attr.aria-label]="'Ir al aviso ' + (index + 1)"
                [attr.aria-current]="activeIndex() === index ? 'true' : null"
                (click)="goToSlide(featuredSwiper, index)"
              ></button>
            }
          </div>
        }
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .featured-carousel {
      height: 25rem;
    }

    .featured-image-panel {
      position: absolute;
      inset-block: 0;
      right: 0;
      width: 66%;
      -webkit-mask-image: linear-gradient(to right, transparent 0%, #000 30%);
      mask-image: linear-gradient(to right, transparent 0%, #000 30%);
    }

    .featured-content {
      width: 50%;
      min-width: 30rem;
    }

    .featured-nav-button {
      display: grid;
      width: 2.75rem;
      height: 2.75rem;
      place-items: center;
      border: 1px solid var(--p-primary-200);
      border-radius: 9999px;
      background: white;
      color: var(--p-primary-800);
      transition: background-color 160ms ease, opacity 160ms ease;
    }

    .featured-nav-button:hover {
      background: var(--p-primary-50);
    }

    .featured-nav-button:disabled {
      pointer-events: none;
      opacity: 0.4;
    }

    .featured-nav-button:focus-visible,
    .featured-dot:focus-visible {
      outline: 2px solid var(--p-primary-600);
      outline-offset: 3px;
    }

    .featured-dot {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 9999px;
      background: var(--p-primary-200);
      transition: width 160ms ease, background-color 160ms ease;
    }

    .featured-dot-active {
      width: 1.75rem;
      background: var(--p-primary-700);
    }

    .featured-link i {
      transition: transform 160ms ease;
    }

    .featured-link:hover i {
      transform: translateX(0.15rem);
    }

    @media (max-width: 767px) {
      .featured-carousel {
        height: 34rem;
      }

      .featured-card {
        display: flex;
        flex-direction: column;
      }

      .featured-image-panel {
        position: relative;
        inset: auto;
        width: 100%;
        height: 44%;
        flex: none;
        -webkit-mask-image: linear-gradient(to bottom, #000 65%, transparent 100%);
        mask-image: linear-gradient(to bottom, #000 65%, transparent 100%);
      }

      .featured-content {
        width: 100%;
        min-width: 0;
        height: 56%;
        margin-top: -2.25rem;
        justify-content: flex-start;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .featured-nav-button,
      .featured-dot,
      .featured-link,
      .featured-link i {
        transition: none;
      }
    }
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturedBannersSection {
  readonly items = input.required<FeaturedBanner[]>();
  readonly hasMultipleItems = computed(() => this.items().length > 1);
  readonly activeIndex = signal(0);
  readonly failedImages = signal<ReadonlySet<number>>(new Set<number>());

  onSlideChange(event: Event): void {
    const [swiper] = (event as CustomEvent<[Swiper]>).detail;
    this.activeIndex.set(swiper.activeIndex);
  }

  previousSlide(element: HTMLElement): void {
    this.getSwiper(element)?.slidePrev();
  }

  nextSlide(element: HTMLElement): void {
    this.getSwiper(element)?.slideNext();
  }

  goToSlide(element: HTMLElement, index: number): void {
    this.getSwiper(element)?.slideTo(index);
  }

  markImageAsFailed(id: number): void {
    this.failedImages.update((failedImages) => new Set(failedImages).add(id));
  }

  isInternalUrl(url: string): boolean {
    return url.startsWith('/');
  }

  validUrl(url: string | null): string | null {
    if (!url) return null;
    return this.isInternalUrl(url) || /^https?:\/\//i.test(url) ? url : null;
  }

  private getSwiper(element: HTMLElement): Swiper | undefined {
    return (element as HTMLElement & { swiper?: Swiper }).swiper;
  }
}
