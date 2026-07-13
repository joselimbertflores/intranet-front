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

import { HeroSlide } from '../../../../models';

register();

@Component({
  selector: 'landing-hero-section',
  imports: [RouterLink],
  template: `
    @if (heroSlides().length) {
      <section class="relative bg-primary-950" aria-label="Contenido destacado">
        <swiper-container
          #heroSwiper
          class="hero-carousel block"
          slides-per-view="1"
          space-between="0"
          keyboard="true"
          a11y="true"
          (swiperslidechange)="onSlideChange($event)"
        >
          @for (slide of heroSlides(); track slide.id; let index = $index) {
            <swiper-slide>
              <article class="relative flex h-full items-end overflow-hidden bg-primary-950 sm:items-center">
                <div class="absolute inset-0 bg-linear-to-br from-primary-950 via-primary-900 to-surface-950" aria-hidden="true"></div>

                @if (!failedImages().has(slide.id)) {
                  <img
                    class="absolute inset-0 h-full w-full object-cover"
                    [src]="slide.imageUrl"
                    alt=""
                    decoding="async"
                    [attr.loading]="index === 0 ? 'eager' : 'lazy'"
                    [attr.fetchpriority]="index === 0 ? 'high' : null"
                    (error)="markImageAsFailed(slide.id)"
                  />
                }

                <div class="absolute inset-0 bg-linear-to-r from-surface-950/95 via-surface-950/68 to-surface-950/12" aria-hidden="true"></div>
                <div class="absolute inset-0 bg-linear-to-t from-surface-950/65 via-transparent to-primary-950/15" aria-hidden="true"></div>

                <div class="relative z-10 mx-auto w-full max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:py-20 lg:px-8">
                  <div class="max-w-3xl">
                    @if (index === 0) {
                      <h1 class="text-balance text-4xl font-extrabold leading-[1.05] tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl">
                        {{ slide.title }}
                      </h1>
                    } @else {
                      <h2 class="text-balance text-4xl font-extrabold leading-[1.05] tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl">
                        {{ slide.title }}
                      </h2>
                    }

                    @if (slide.description) {
                      <p class="mt-5 max-w-2xl text-pretty text-base leading-7 text-white/85 sm:text-lg sm:leading-8">
                        {{ slide.description }}
                      </p>
                    }

                    @if (slide.linkLabel && getValidLink(slide.linkUrl); as linkUrl) {
                      <div class="mt-7">
                        @if (isInternalLink(linkUrl)) {
                          <a
                            [routerLink]="linkUrl"
                            class="hero-link inline-flex min-h-12 items-center gap-3 rounded-xl bg-primary-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-surface-950/25 outline-none transition-colors hover:bg-primary-400 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-surface-950"
                          >
                            {{ slide.linkLabel }}
                            <i class="pi pi-arrow-right text-xs" aria-hidden="true"></i>
                          </a>
                        } @else {
                          <a
                            [href]="linkUrl"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="hero-link inline-flex min-h-12 items-center gap-3 rounded-xl bg-primary-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-surface-950/25 outline-none transition-colors hover:bg-primary-400 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-surface-950"
                          >
                            {{ slide.linkLabel }}
                            <i class="pi pi-arrow-up-right text-xs" aria-hidden="true"></i>
                          </a>
                        }
                      </div>
                    }
                  </div>
                </div>
              </article>
            </swiper-slide>
          }
        </swiper-container>

        @if (hasMultipleSlides()) {
          <button
            type="button"
            class="hero-nav-button left-3 sm:left-5 lg:left-7"
            aria-label="Mostrar contenido anterior"
            [disabled]="activeIndex() === 0"
            (click)="previousSlide(heroSwiper)"
          >
            <i class="pi pi-chevron-left" aria-hidden="true"></i>
          </button>

          <button
            type="button"
            class="hero-nav-button right-3 sm:right-5 lg:right-7"
            aria-label="Mostrar contenido siguiente"
            [disabled]="activeIndex() === heroSlides().length - 1"
            (click)="nextSlide(heroSwiper)"
          >
            <i class="pi pi-chevron-right" aria-hidden="true"></i>
          </button>

          <div
            class="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-surface-950/35 px-3 py-2 backdrop-blur-sm"
            aria-label="Seleccionar contenido destacado"
          >
            @for (slide of heroSlides(); track slide.id; let index = $index) {
              <button
                type="button"
                class="hero-dot"
                [class.hero-dot-active]="activeIndex() === index"
                [attr.aria-label]="'Ir al contenido ' + (index + 1)"
                [attr.aria-current]="activeIndex() === index ? 'true' : null"
                (click)="goToSlide(heroSwiper, index)"
              ></button>
            }
          </div>
        }
      </section>
    } @else {
      <section class="hero-empty relative overflow-hidden bg-linear-to-br from-primary-950 via-primary-900 to-primary-700 text-white">
        <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 0); background-size: 30px 30px" aria-hidden="true"></div>
        <div class="relative mx-auto flex h-full max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
          <div class="max-w-2xl">
            <h1 class="text-4xl font-extrabold leading-tight tracking-[-0.035em] sm:text-5xl lg:text-6xl">
              Intranet
            </h1>
            <p class="mt-4 text-lg font-medium text-primary-100">
              Gobierno Autónomo Municipal de Sacaba
            </p>
          </div>
        </div>
      </section>
    }
  `,
  styles: `
    :host {
      display: block;
    }

    .hero-carousel,
    .hero-empty {
      height: clamp(430px, 62vh, 620px);
    }

    .hero-nav-button {
      position: absolute;
      top: 50%;
      z-index: 20;
      display: grid;
      width: 2.75rem;
      height: 2.75rem;
      transform: translateY(-50%);
      place-items: center;
      border: 1px solid rgb(255 255 255 / 0.28);
      border-radius: 9999px;
      background: rgb(2 6 23 / 0.4);
      color: white;
      backdrop-filter: blur(6px);
      transition: background-color 180ms ease, opacity 180ms ease;
    }

    .hero-nav-button:hover {
      background: rgb(2 6 23 / 0.65);
    }

    .hero-nav-button:disabled {
      pointer-events: none;
      opacity: 0.32;
    }

    .hero-nav-button:focus-visible,
    .hero-dot:focus-visible {
      outline: 2px solid white;
      outline-offset: 3px;
    }

    .hero-dot {
      width: 0.45rem;
      height: 0.45rem;
      border-radius: 9999px;
      background: rgb(255 255 255 / 0.55);
      transition: width 180ms ease, background-color 180ms ease;
    }

    .hero-dot-active {
      width: 1.6rem;
      background: var(--p-primary-400);
    }

    .hero-link i {
      transition: transform 180ms ease;
    }

    .hero-link:hover i {
      transform: translateX(0.2rem);
    }

    @media (max-width: 639px) {
      .hero-carousel,
      .hero-empty {
        height: clamp(430px, 72svh, 560px);
      }

      .hero-nav-button {
        top: auto;
        bottom: 1rem;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .hero-link,
      .hero-link i,
      .hero-nav-button,
      .hero-dot {
        transition: none;
      }
    }
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingHeroSection {
  readonly heroSlides = input.required<HeroSlide[]>();
  readonly hasMultipleSlides = computed(() => this.heroSlides().length > 1);
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

  isInternalLink(linkUrl: string): boolean {
    return linkUrl.startsWith('/');
  }

  getValidLink(linkUrl: string | null): string | null {
    if (!linkUrl) return null;

    return this.isInternalLink(linkUrl) || /^https?:\/\//i.test(linkUrl)
      ? linkUrl
      : null;
  }

  private getSwiper(element: HTMLElement): Swiper | undefined {
    return (element as HTMLElement & { swiper?: Swiper }).swiper;
  }
}
