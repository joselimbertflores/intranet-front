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
  lucideArrowRight,
  lucideArrowUpRight,
  lucideImageOff,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCarouselImports } from '@spartan-ng/helm/carousel';
import Autoplay from 'embla-carousel-autoplay';

import { HeroSlide } from '../../../../models';
import { LandingReveal } from '../../scroll-reveal.directive';

@Component({
  selector: 'landing-hero-section',
  imports: [
    HlmButtonImports,
    HlmCarouselImports,
    LandingReveal,
    NgIcon,
    NgOptimizedImage,
    RouterLink,
  ],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucideArrowUpRight,
      lucideImageOff,
    }),
  ],
  template: `
    @if (slides().length) {
      <section
        class="hero-stage relative overflow-hidden text-white"
        aria-label="Contenido destacado"
      >
        <hlm-carousel
          #heroCarousel
          landingReveal
          class="w-full"
          aria-label="Carrusel de contenido destacado"
          [options]="carouselOptions()"
          [plugins]="plugins()"
        >
          <hlm-carousel-content class="ml-0">
            @for (slide of slides(); track slide.id; let index = $index) {
              <hlm-carousel-item class="pl-0">
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
                    class="hero-photo-veil absolute inset-0"
                    aria-hidden="true"
                  ></div>
                  <div
                    class="hero-photo-vertical absolute inset-0"
                    aria-hidden="true"
                  ></div>
                  <div
                    class="hero-photo-horizontal absolute inset-0"
                    aria-hidden="true"
                  ></div>
                  <div
                    class="relative mx-auto flex h-full w-full max-w-7xl items-end px-14 pb-16 pt-12 sm:px-20 sm:pb-18 lg:items-center lg:px-24 lg:pb-14"
                  >
                    <div class="max-w-3xl">
                      @if (index === 0) {
                        <h1
                          class="font-display max-w-[18ch] text-balance text-[2.25rem] leading-[1.02] tracking-[-0.035em] sm:text-5xl lg:text-[3.75rem]"
                        >
                          {{ slide.title }}
                        </h1>
                      } @else {
                        <h2
                          class="font-display max-w-[18ch] text-balance text-[2.25rem] leading-[1.02] tracking-[-0.035em] sm:text-5xl lg:text-[3.75rem]"
                        >
                          {{ slide.title }}
                        </h2>
                      }

                      @if (slide.description) {
                        <p
                          class="mt-4 max-w-[58ch] text-pretty text-base leading-7 font-medium text-white/85 sm:text-lg"
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
                              <ng-icon name="lucideArrowRight" />
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
                              <ng-icon name="lucideArrowUpRight" />
                            </a>
                          }
                        </div>
                      }
                    </div>
                  </div>
                </article>
              </hlm-carousel-item>
            }
          </hlm-carousel-content>

          @if (hasMultipleSlides()) {
            <button
              hlmCarouselPrevious
              type="button"
              size="icon-lg"
              class="hero-side-control start-3 top-1/2 size-11 -translate-y-1/2 sm:start-5"
              aria-label="Mostrar contenido anterior"
            ></button>

            <button
              hlmCarouselNext
              type="button"
              size="icon-lg"
              class="hero-side-control end-3 top-1/2 size-11 -translate-y-1/2 sm:end-5"
              aria-label="Mostrar contenido siguiente"
            ></button>

            <div
              class="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 sm:bottom-5"
              aria-hidden="true"
            >
              @for (slide of slides(); track slide.id; let index = $index) {
                <span
                  class="hero-indicator"
                  [class.hero-indicator-active]="
                    heroCarousel.currentSlide() === index
                  "
                ></span>
              }
            </div>
            <p class="sr-only" aria-live="polite">
              Contenido {{ heroCarousel.currentSlide() + 1 }} de
              {{ slides().length }}
            </p>
          }
        </hlm-carousel>
      </section>
    } @else {
      <section
        landingReveal
        class="landing-hero-fallback relative overflow-hidden text-white"
        aria-labelledby="landing-hero-fallback-title"
      >
        <div
          class="relative mx-auto flex h-full w-full max-w-7xl items-end px-14 pb-16 pt-12 sm:px-20 sm:pb-18 lg:items-center lg:px-24 lg:pb-14"
        >
          <div class="max-w-3xl">
            <h1
              id="landing-hero-fallback-title"
              class="font-display max-w-[18ch] text-balance text-[2.25rem] leading-[1.02] tracking-[-0.035em] sm:text-5xl lg:text-[3.75rem]"
            >
              Intranet institucional
            </h1>
            <p
              class="mt-4 max-w-[58ch] text-pretty text-base leading-7 font-medium text-white/85 sm:text-lg"
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingHeroSection {
  private readonly autoplay = Autoplay({
    delay: 5500,
    playOnInit: true,
    stopOnInteraction: false,
    stopOnMouseEnter: true,
    stopOnFocusIn: true,
    breakpoints: {
      '(prefers-reduced-motion: reduce)': { active: false },
    },
  });

  readonly slides = input.required<HeroSlide[]>();
  readonly failedImages = signal<ReadonlySet<number>>(new Set());
  readonly hasMultipleSlides = computed(() => this.slides().length > 1);
  readonly carouselOptions = computed(() => ({
    loop: this.hasMultipleSlides(),
    align: 'start' as const,
  }));
  readonly plugins = computed(() =>
    this.hasMultipleSlides() ? [this.autoplay] : [],
  );

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
