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
      <section class="relative bg-surface-950" aria-label="Contenido destacado">
        <swiper-container
          #heroSwiper
          class="hero-carousel block"
          slides-per-view="1"
          space-between="0"
          keyboard="true"
          a11y="true"
          (swiperslidechange)="onSlideChange($event)"
        >
          @for (slide of heroSlides(); track slide.id) {
            <swiper-slide>
              <article
                class="relative flex h-full items-center overflow-hidden bg-surface-950"
              >
                <img
                  class="absolute inset-0 h-full w-full object-cover"
                  [src]="slide.imageUrl"
                  alt=""
                />
                <div
                  class="absolute inset-0 bg-linear-to-r from-surface-950/90 via-surface-950/60 to-surface-950/10"
                ></div>
                <div
                  class="absolute inset-0 bg-linear-to-t from-surface-950/30 via-transparent to-surface-950/10"
                ></div>

                <div
                  class="relative z-10 mx-auto w-full max-w-7xl px-6 py-16 sm:px-8 lg:px-10"
                >
                  <div class="max-w-2xl">
                    <h1
                      class="text-balance font-sans text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl"
                    >
                      {{ slide.title }}
                    </h1>

                    @if (slide.description) {
                      <p
                        class="mt-5 max-w-xl text-pretty text-base leading-7 text-white/80 sm:text-lg sm:leading-8"
                      >
                        {{ slide.description }}
                      </p>
                    }

                    @if (getValidLink(slide.linkUrl); as linkUrl) {
                      <div class="mt-8">
                        @if (isInternalLink(linkUrl)) {
                          <a
                            [routerLink]="linkUrl"
                            class="hero-link inline-flex min-h-11 items-center gap-3 rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                          >
                            {{ slide.linkLabel || 'Ver más' }}
                            <i
                              class="pi pi-arrow-right text-xs"
                              aria-hidden="true"
                            ></i>
                          </a>
                        } @else {
                          <a
                            [href]="linkUrl"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="hero-link inline-flex min-h-11 items-center gap-3 rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                          >
                            {{ slide.linkLabel || 'Ver más' }}
                            <i
                              class="pi pi-arrow-up-right text-xs"
                              aria-hidden="true"
                            ></i>
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
            class="hero-nav-button left-4 lg:left-6"
            aria-label="Mostrar slide anterior"
            [disabled]="activeIndex() === 0"
            (click)="previousSlide(heroSwiper)"
          >
            <i class="pi pi-chevron-left" aria-hidden="true"></i>
          </button>

          <button
            type="button"
            class="hero-nav-button right-4 lg:right-6"
            aria-label="Mostrar slide siguiente"
            [disabled]="activeIndex() === heroSlides().length - 1"
            (click)="nextSlide(heroSwiper)"
          >
            <i class="pi pi-chevron-right" aria-hidden="true"></i>
          </button>

          <div
            class="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2"
            aria-label="Seleccionar contenido destacado"
          >
            @for (slide of heroSlides(); track slide.id; let index = $index) {
              <button
                type="button"
                class="hero-dot"
                [class.hero-dot-active]="activeIndex() === index"
                [attr.aria-label]="'Ir al slide ' + (index + 1)"
                [attr.aria-current]="activeIndex() === index ? 'true' : null"
                (click)="goToSlide(heroSwiper, index)"
              ></button>
            }
          </div>
        }
      </section>
    } @else {
      <section
        class="relative h-[clamp(360px,52vh,520px)] overflow-hidden border-b border-surface-200 bg-linear-to-br from-primary-100/80 via-surface-0 to-primary-200/40"
      >
        <div
          class="mx-auto flex h-full max-w-7xl items-center px-6 py-16 sm:px-8 lg:px-10"
        >
          <div class="max-w-2xl">
            <h1
              class="font-sans text-3xl font-semibold leading-tight tracking-tight text-surface-950 sm:text-4xl lg:text-5xl"
            >
              Intranet institucional
            </h1>
            <p
              class="mt-5 max-w-xl text-base leading-7 text-surface-700 sm:text-lg sm:leading-8"
            >
              Consulta información, documentos y recursos internos del Gobierno
              Autónomo Municipal de Sacaba.
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

    .hero-carousel {
      height: clamp(360px, 52vh, 520px);
    }

    .hero-nav-button {
      position: absolute;
      top: 50%;
      z-index: 20;
      display: flex;
      width: 2.75rem;
      height: 2.75rem;
      transform: translateY(-50%);
      align-items: center;
      justify-content: center;
      border: 1px solid rgb(255 255 255 / 0.25);
      border-radius: 9999px;
      background: rgb(15 23 42 / 0.35);
      color: #fff;
      backdrop-filter: blur(4px);
      transition:
        background-color 180ms ease,
        opacity 180ms ease;
    }

    .hero-nav-button:hover {
      background: rgb(15 23 42 / 0.55);
    }

    .hero-nav-button:focus-visible,
    .hero-dot:focus-visible {
      outline: 2px solid #fff;
      outline-offset: 3px;
    }

    .hero-nav-button:disabled {
      pointer-events: none;
      opacity: 0.35;
    }

    .hero-nav-button i {
      font-size: 1.125rem;
      line-height: 1;
    }

    .hero-dot {
      width: 0.375rem;
      height: 0.375rem;
      border-radius: 9999px;
      background: rgb(255 255 255 / 0.55);
      transition:
        width 180ms ease,
        background-color 180ms ease;
    }

    .hero-dot-active {
      width: 1.5rem;
      background: var(--p-primary-400);
    }

    .hero-link:hover i {
      transform: translateX(0.2rem);
    }

    .hero-link i {
      transition: transform 180ms ease;
    }

    @media (prefers-reduced-motion: reduce) {
      .hero-link,
      .hero-link i,
      .hero-nav-button,
      .hero-dot {
        transition: none;
      }
    }

    @media (max-width: 639px) {
      .hero-nav-button {
        display: none;
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

  isInternalLink(linkUrl: string): boolean {
    return linkUrl.startsWith('/');
  }

  isExternalLink(linkUrl: string): boolean {
    return /^https?:\/\//i.test(linkUrl);
  }

  getValidLink(linkUrl: string | null): string | null {
    if (!linkUrl) return null;

    return this.isInternalLink(linkUrl) || this.isExternalLink(linkUrl)
      ? linkUrl
      : null;
  }

  private getSwiper(element: HTMLElement): Swiper | undefined {
    return (element as HTMLElement & { swiper?: Swiper }).swiper;
  }
}
