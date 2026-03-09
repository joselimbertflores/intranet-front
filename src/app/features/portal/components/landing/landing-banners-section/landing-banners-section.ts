import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  input,
} from '@angular/core';
import { RouterModule } from '@angular/router';

import { BannerResponse } from '../../../../administration/content-settings/interfaces';

@Component({
  selector: 'landing-banners-section',
  imports: [CommonModule, RouterModule],
  template: `
    <section class="relative py-14 sm:py-16 lg:py-20">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="mb-8 max-w-3xl sm:mb-10">
          <span
            class="inline-flex rounded-full border border-primary-200/80 bg-primary-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary-700"
          >
            Destacados
          </span>

          <h2
            class="mt-4 text-3xl font-semibold tracking-tight text-surface-950 sm:text-4xl"
          >
            Informaci&oacute;n relevante del portal
          </h2>

          <p class="mt-3 max-w-2xl text-sm leading-7 text-surface-600 sm:text-base">
            Campa&ntilde;as, avisos y contenidos con prioridad de visualizaci&oacute;n
            dentro de la intranet.
          </p>
        </div>

        <swiper-container
          class="block overflow-visible pb-10"
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
                    class="block h-full rounded-[2rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
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
                    class="block h-full rounded-[2rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
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
            class="group flex h-full min-h-[26rem] flex-col overflow-hidden rounded-[2rem] border border-surface-200/80 bg-surface-0/95 shadow-[0_24px_70px_-50px_rgba(15,23,42,0.3)] transition-all duration-500 hover:-translate-y-1 hover:border-primary-200 hover:shadow-[0_32px_90px_-48px_rgba(37,99,235,0.28)] lg:grid lg:grid-cols-5"
          >
            <div
              class="relative aspect-video w-full bg-surface-100 lg:col-span-3 lg:h-full lg:aspect-auto"
            >
              <img
                [src]="banner.imageUrl"
                [alt]="banner.title"
                class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div
                class="pointer-events-none absolute inset-0 bg-linear-to-tr from-surface-950/25 via-transparent to-primary-900/10"
              ></div>
            </div>

            <div
              class="relative flex flex-col justify-center p-8 sm:p-10 lg:col-span-2 lg:p-12"
            >
              <span
                class="inline-flex w-fit rounded-full bg-primary-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-700"
              >
                Contenido destacado
              </span>

              <h3
                class="mt-5 line-clamp-2 text-2xl font-semibold leading-tight text-surface-950 text-balance sm:text-3xl"
              >
                {{ banner.title }}
              </h3>

              @if (banner.subtitle) {
                <p
                  class="mt-4 line-clamp-3 text-sm leading-7 text-surface-600 sm:text-base"
                >
                  {{ banner.subtitle }}
                </p>
              }

              @if (banner.url) {
                <div
                  class="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-primary-700"
                >
                  Ver informaci&oacute;n completa
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
  styles: `
    :host {
      display: block;
    }

    swiper-slide {
      height: auto;
    }

    swiper-container::part(pagination) {
      bottom: 0.25rem;
    }

    swiper-container::part(bullet) {
      width: 0.65rem;
      height: 0.65rem;
      border-radius: 999px;
      opacity: 1;
      background: color-mix(in srgb, var(--p-primary-color) 28%, white);
    }

    swiper-container::part(bullet-active) {
      width: 1.75rem;
      background: var(--p-primary-color);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LandingBannersSection {
  banners = input.required<BannerResponse[]>();

  autoplayConfig = {
    delay: 5000,
    disableOnInteraction: false,
    pauseOnMouseEnter: true,
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
