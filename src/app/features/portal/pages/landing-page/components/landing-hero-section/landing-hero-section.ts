import { DOCUMENT, isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  PLATFORM_ID,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  signal,
  viewChild,
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
import { HlmCarousel, HlmCarouselImports } from '@spartan-ng/helm/carousel';
import Autoplay from 'embla-carousel-autoplay';

import { HeroSlide } from '../../../../models';

@Component({
  selector: 'landing-hero-section',
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
    @if (slides().length) {
      <section
        class="hero-stage relative overflow-hidden text-white"
        aria-label="Contenido destacado"
        (mouseenter)="setPointerInside(true)"
        (mouseleave)="setPointerInside(false)"
        (focusin)="setFocusInside(true)"
        (focusout)="onFocusOut($event)"
        (keydown)="onCarouselKeydown($event)"
      >
        <hlm-carousel
          #heroCarousel
          class="w-full"
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
                              [routerLink]="url"
                            >
                              {{ slide.linkLabel }}
                              <ng-icon name="lucideArrowRight" />
                            </a>
                          } @else {
                            <a
                              hlmBtn
                              size="lg"
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
              type="button"
              class="hero-side-control absolute top-1/2 left-3 grid size-8 -translate-y-1/2 place-items-center rounded-full outline-none sm:left-5 sm:size-9"
              aria-label="Mostrar contenido anterior"
              (click)="showPreviousSlide()"
            >
              <ng-icon name="lucideArrowLeft" />
            </button>

            <button
              type="button"
              class="hero-side-control absolute top-1/2 right-3 grid size-8 -translate-y-1/2 place-items-center rounded-full outline-none sm:right-5 sm:size-9"
              aria-label="Mostrar contenido siguiente"
              (click)="showNextSlide()"
            >
              <ng-icon name="lucideArrowRight" />
            </button>

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
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly carousel = viewChild<HlmCarousel>('heroCarousel');
  private readonly autoplay = Autoplay({
    delay: 5500,
    playOnInit: true,
    stopOnInteraction: false,
    stopOnMouseEnter: false,
    stopOnFocusIn: false,
  });
  private readonly pointerInside = signal(false);
  private readonly focusInside = signal(false);
  private readonly pageHidden = signal(false);

  readonly slides = input.required<HeroSlide[]>();
  readonly reducedMotion = signal(false);
  readonly failedImages = signal<ReadonlySet<number>>(new Set());
  readonly hasMultipleSlides = computed(() => this.slides().length > 1);
  readonly carouselOptions = computed(() => ({
    loop: this.hasMultipleSlides(),
    align: 'start' as const,
  }));
  readonly plugins = computed(() =>
    this.hasMultipleSlides() && !this.reducedMotion() && !this.pageHidden()
      ? [this.autoplay]
      : [],
  );

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => {
      this.reducedMotion.set(motionQuery.matches);
      this.syncAutoplay();
    };
    const updateVisibility = () => {
      this.pageHidden.set(this.document.hidden);
      this.syncAutoplay();
    };

    updateMotionPreference();
    updateVisibility();
    motionQuery.addEventListener('change', updateMotionPreference);
    this.document.addEventListener('visibilitychange', updateVisibility);

    this.destroyRef.onDestroy(() => {
      motionQuery.removeEventListener('change', updateMotionPreference);
      this.document.removeEventListener('visibilitychange', updateVisibility);
    });
  }

  setPointerInside(inside: boolean): void {
    this.pointerInside.set(inside);
    this.syncAutoplay();
  }

  setFocusInside(inside: boolean): void {
    this.focusInside.set(inside);
    this.syncAutoplay();
  }

  onFocusOut(event: FocusEvent): void {
    const currentTarget = event.currentTarget as HTMLElement;
    const nextTarget = event.relatedTarget as Node | null;

    if (nextTarget && currentTarget.contains(nextTarget)) return;
    this.setFocusInside(false);
  }

  onCarouselKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      this.restartAutoplayTimer();
    }
  }

  showPreviousSlide(): void {
    this.carousel()?.scrollPrev();
    this.restartAutoplayTimer();
  }

  showNextSlide(): void {
    this.carousel()?.scrollNext();
    this.restartAutoplayTimer();
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

  private shouldPauseAutoplay(): boolean {
    return (
      this.reducedMotion() ||
      this.pageHidden() ||
      this.pointerInside() ||
      this.focusInside()
    );
  }

  private syncAutoplay(): void {
    if (!this.carousel()) return;

    if (this.shouldPauseAutoplay()) {
      this.autoplay.stop();
    } else {
      this.autoplay.play();
    }
  }

  private restartAutoplayTimer(): void {
    if (!this.shouldPauseAutoplay()) this.autoplay.reset();
  }
}
