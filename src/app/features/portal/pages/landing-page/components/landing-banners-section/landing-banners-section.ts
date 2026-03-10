import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  input,
} from '@angular/core';
import { RouterModule } from '@angular/router';

import { AnimateOnScroll } from 'primeng/animateonscroll';
import { register } from 'swiper/element/bundle';

import { BannerResponse } from '../../../../../administration/content-settings/interfaces';

register();
@Component({
  selector: 'landing-banners-section',
  imports: [CommonModule, RouterModule, AnimateOnScroll],
  template: `
    <section
      class="relative py-16 md:py-24"
      pAnimateOnScroll
      enterClass="animate-enter fade-in-0 slide-in-from-r-8 animate-duration-500 ease-out"
      [once]="true"
      [threshold]="0.2"
    >
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="mb-8 max-w-3xl">
          <span
            class="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-700 ring-1 ring-inset ring-primary-700/10"
          >
            Destacados
          </span>

          <h2
            class="mt-4 text-3xl font-semibold tracking-tight text-surface-900 sm:text-4xl"
          >
            Información relevante del portal
          </h2>

          <p class="mt-3 text-sm text-surface-600 sm:text-base">
            Campañas, avisos y contenidos con prioridad de visualización dentro
            de la intranet.
          </p>
        </div>

        <swiper-container
          class="block overflow-visible pb-8"
          slides-per-view="1"
          space-between="24"
          [breakpoints]="bannerBreakpoints"
          [pagination]="true"
          [loop]="banners().length > 2"
          [rewind]="banners().length === 2"
          [autoplay]="banners().length > 2 ? autoplayConfig : false"
        >
          @for (banner of banners(); track banner.id) {
            <swiper-slide>
              @if (banner.url) {
                @if (usesRouterLink(banner.linkType, banner.openInNewTab)) {
                  <a
                    [routerLink]="banner.url"
                    class="block rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 h-full"
                  >
                    <ng-container
                      *ngTemplateOutlet="
                        bannerContent;
                        context: { $implicit: banner }
                      "
                    ></ng-container>
                  </a>
                } @else {
                  <a
                    [href]="banner.url"
                    [target]="banner.openInNewTab ? '_blank' : '_self'"
                    [attr.rel]="
                      banner.openInNewTab ? 'noopener noreferrer' : null
                    "
                    class="block rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 h-full"
                  >
                    <ng-container
                      *ngTemplateOutlet="
                        bannerContent;
                        context: { $implicit: banner }
                      "
                    ></ng-container>
                  </a>
                }
              } @else {
                <ng-container
                  *ngTemplateOutlet="
                    bannerContent;
                    context: { $implicit: banner }
                  "
                ></ng-container>
              }
            </swiper-slide>
          }
        </swiper-container>

        <ng-template #bannerContent let-banner>
          <div
            class="group h-full overflow-hidden rounded-3xl border border-surface-200 bg-surface-0 shadow-sm transition-all duration-500 ease-out hover:border-surface-300/80 hover:shadow-2xl flex flex-col lg:grid lg:grid-cols-5 min-h-[26rem]"
          >
            <div
              class="relative w-full aspect-video lg:aspect-auto lg:h-full lg:col-span-3 bg-surface-100"
            >
              <img
                [src]="banner.imageUrl"
                [alt]="banner.title"
                class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div
                class="absolute inset-0 from-black/20 via-transparent to-transparent opacity-80 pointer-events-none"
              ></div>
            </div>

            <div
              class="relative flex flex-col justify-center p-8 sm:p-10 lg:p-12 lg:col-span-2"
            >
              <h3
                class="text-2xl font-bold leading-tight text-surface-900 sm:text-3xl text-balance line-clamp-2"
              >
                {{ banner.title }}
              </h3>

              @if (banner.subtitle) {
                <p
                  class="mt-4 text-sm leading-relaxed text-surface-600 sm:text-base line-clamp-3"
                >
                  {{ banner.subtitle }}
                </p>
              }

              @if (banner.url) {
                <div
                  class="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 transition-colors group-hover:text-primary-700"
                >
                  Ver información completa
                  <i
                    class="pi pi-arrow-right text-xs transition-transform duration-300 group-hover:translate-x-1.5"
                  ></i>
                </div>
              }
            </div>
          </div>
        </ng-template>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LandingBannersSection {
  banners = input.required<BannerResponse[]>();

  autoplayConfig = {
    delay: 5000, // 5 segundos por cada banner
    disableOnInteraction: false, // Sigue rotando aunque el usuario haya hecho clic antes
    pauseOnMouseEnter: true, // ¡Vital para accesibilidad! Pausa si el usuario pone el cursor encima para leer
  };

  bannerBreakpoints = {
    768: {
      spaceBetween: 24,
    },
    1024: {
      spaceBetween: 32,
    },
  };

  usesRouterLink(linkType: string, openInNewTab: boolean): boolean {
    return linkType === 'internal' && !openInNewTab;
  }
}
