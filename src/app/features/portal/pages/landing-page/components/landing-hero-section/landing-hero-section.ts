import { NgOptimizedImage } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  computed,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideArrowUpRight,
  lucideChevronLeft,
  lucideChevronRight,
  lucideImageOff,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { register } from 'swiper/element/bundle';
import type { SwiperContainer } from 'swiper/element';
import type { SwiperOptions } from 'swiper/types';

import { HeroSlide } from '../../../../models';
import { LandingReveal } from '../../scroll-reveal.directive';

register();

@Component({
  selector: 'landing-hero-section',
  imports: [
    HlmButtonImports,
    LandingReveal,
    NgIcon,
    NgOptimizedImage,
    RouterLink,
  ],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucideArrowUpRight,
      lucideChevronLeft,
      lucideChevronRight,
      lucideImageOff,
    }),
  ],
  template: `
    @if (slides().length) {
      <section
        class="hero-stage relative overflow-hidden text-white"
        aria-label="Contenido destacado"
      >
        <swiper-container
          #heroCarousel
          init="false"
          landingReveal
          class="hero-swiper block w-full"
          aria-label="Carrusel de contenido destacado"
        >
          @for (slide of slides(); track slide.id; let index = $index) {
            <swiper-slide>
              <article class="hero-slide relative overflow-hidden">
                @if (!failedImages().has(slide.id)) {
                  <img
                    [ngSrc]="slide.imageUrl"
                    fill
                    sizes="100vw"
                    [priority]="index === 0"
                    class="hero-photo object-cover"
                    alt=""
                    (error)="markImageAsFailed(slide.id)"
                  />
                } @else {
                  <div
                    class="hero-image-fallback absolute inset-0 grid place-items-center"
                    aria-hidden="true"
                  >
                    <ng-icon
                      name="lucideImageOff"
                      size="3.75rem"
                      class="text-white/45"
                    />
                  </div>
                }

                <div
                  class="hero-photo-overlay absolute inset-0"
                  aria-hidden="true"
                ></div>
                <div
                  class="relative mx-auto flex h-full w-full max-w-7xl items-center px-16 py-12 text-left sm:px-20 lg:px-24"
                >
                  <div class="max-w-3xl">
                    @if (index === 0) {
                      <h1
                        class="hero-title max-w-[18ch] text-balance font-bold"
                      >
                        {{ slide.title }}
                      </h1>
                    } @else {
                      <h2
                        class="hero-title max-w-[18ch] text-balance font-bold"
                      >
                        {{ slide.title }}
                      </h2>
                    }

                    @if (slide.description) {
                      <p
                        class="hero-description mt-5 max-w-3xl text-pretty font-medium text-white/88"
                      >
                        {{ slide.description }}
                      </p>
                    }

                    @if (slide.linkLabel && validUrl(slide.linkUrl); as url) {
                      <div class="mt-6">
                        @if (isInternalUrl(url)) {
                          <a
                            hlmBtn
                            size="lg"
                            class="hero-cta"
                            [routerLink]="url"
                          >
                            {{ slide.linkLabel }}
                            <ng-icon name="lucideArrowRight" data-icon="inline-end" />
                          </a>
                        } @else {
                          <a
                            hlmBtn
                            size="lg"
                            class="hero-cta"
                            [href]="url"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {{ slide.linkLabel }}
                            <ng-icon name="lucideArrowUpRight" data-icon="inline-end" />
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
            #previousButton
            hlmBtn
            type="button"
            variant="ghost"
            size="icon-lg"
            class="hero-side-control hero-side-control-previous size-11"
            aria-label="Banner anterior"
          >
            <ng-icon name="lucideChevronLeft" aria-hidden="true" />
          </button>

          <button
            #nextButton
            hlmBtn
            type="button"
            variant="ghost"
            size="icon-lg"
            class="hero-side-control hero-side-control-next size-11"
            aria-label="Banner siguiente"
          >
            <ng-icon name="lucideChevronRight" aria-hidden="true" />
          </button>
        }
      </section>
    } @else {
      <section
        landingReveal
        class="landing-hero-fallback relative overflow-hidden text-white"
        aria-labelledby="landing-hero-fallback-title"
      >
        <div
          class="relative mx-auto flex h-full w-full max-w-7xl items-center px-16 py-12 text-left sm:px-20 lg:px-24"
        >
          <div class="max-w-3xl">
            <h1
              id="landing-hero-fallback-title"
              class="hero-title max-w-[18ch] text-balance font-bold"
            >
              Intranet institucional
            </h1>
            <p
              class="hero-description mt-5 max-w-3xl text-pretty font-medium text-white/88"
            >
              Acceda a información, documentos y recursos institucionales del
              Gobierno Autónomo Municipal de Sacaba.
            </p>
          </div>
        </div>
      </section>
    }
  `,
  styleUrl: './landing-hero-section.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingHeroSection implements AfterViewInit {
  private readonly heroCarousel =
    viewChild<ElementRef<SwiperContainer>>('heroCarousel');
  private readonly previousButton =
    viewChild<ElementRef<HTMLButtonElement>>('previousButton');
  private readonly nextButton =
    viewChild<ElementRef<HTMLButtonElement>>('nextButton');

  readonly slides = input.required<HeroSlide[]>();
  readonly failedImages = signal<ReadonlySet<number>>(new Set());
  readonly hasMultipleSlides = computed(() => this.slides().length > 1);

  ngAfterViewInit(): void {
    const carousel = this.heroCarousel()?.nativeElement;
    if (!carousel) return;

    const hasMultipleSlides = this.hasMultipleSlides();
    const prefersReducedMotion =
      globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ??
      false;
    const previousButton = this.previousButton()?.nativeElement;
    const nextButton = this.nextButton()?.nativeElement;

    const options: SwiperOptions = {
      slidesPerView: 1,
      effect: 'fade',
      fadeEffect: { crossFade: true },
      speed: prefersReducedMotion ? 0 : 700,
      loop: hasMultipleSlides,
      enabled: hasMultipleSlides,
      allowTouchMove: hasMultipleSlides,
      autoplay:
        hasMultipleSlides && !prefersReducedMotion
          ? {
              delay: 6000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }
          : false,
      navigation:
        hasMultipleSlides && previousButton && nextButton
          ? {
              prevEl: previousButton,
              nextEl: nextButton,
            }
          : false,
      pagination: hasMultipleSlides ? { type: 'bullets' } : false,
      a11y: {
        enabled: true,
        containerMessage: 'Carrusel de contenido destacado',
        prevSlideMessage: 'Banner anterior',
        nextSlideMessage: 'Banner siguiente',
        paginationBulletMessage: 'Ir al banner {{index}}',
      },
    };

    Object.assign(carousel, options);
    carousel.initialize();
  }

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
