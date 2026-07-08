import { Component, computed, input, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ButtonDirective, ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';

import { FeaturedBanner } from '../../../../models';

@Component({
  selector: 'featured-banners-section',
  imports: [CarouselModule, RouterLink, ButtonDirective, ButtonModule],
  template: `
    @if (items().length) {
      <section
        class="border-y border-surface-200 bg-surface-50/60 py-12 md:py-16"
        aria-labelledby="featured-banners-title"
      >
        <div class="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
          <h2
            id="featured-banners-title"
            class="mb-7 text-2xl font-bold tracking-tight text-surface-900 sm:text-3xl"
          >
            Avisos destacados
          </h2>

          <p-carousel
            [value]="items()"
            [numVisible]="1"
            [numScroll]="1"
            [circular]="hasMultipleItems()"
            [autoplayInterval]="autoplayInterval()"
            [showNavigators]="hasMultipleItems()"
            [showIndicators]="hasMultipleItems()"
          >
            <ng-template pTemplate="item" let-banner>
              <article
                class="mx-1 grid overflow-hidden rounded-2xl border border-surface-200 bg-surface-0 shadow-sm md:min-h-[280px] md:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]"
              >
                <div
                  class="order-1 h-48 overflow-hidden bg-surface-100 sm:h-56 md:order-2 md:h-auto"
                >
                  <img
                    [src]="banner.imageUrl"
                    [alt]="banner.title"
                    class="h-full w-full object-cover"
                  />
                </div>

                <div
                  class="order-2 flex min-h-60 flex-col justify-center border-t-4 border-primary-500 p-6 sm:p-8 md:order-1 md:min-h-0 md:border-t-0 md:border-l-4 md:px-10 md:py-8 lg:px-12"
                >
                  <h3
                    class="text-balance text-2xl font-semibold leading-tight tracking-tight text-surface-900 sm:text-3xl"
                  >
                    {{ banner.title }}
                  </h3>

                  @if (banner.description) {
                    <p
                      class="mt-3 max-w-2xl text-pretty text-sm leading-6 text-surface-600 sm:text-base sm:leading-7"
                    >
                      {{ banner.description }}
                    </p>
                  }

                  @if (validUrl(banner.url); as url) {
                    <div class="mt-6">
                      @if (isInternalUrl(url)) {
                        <a
                          [routerLink]="url"
                          pButton
                          icon="pi pi-arrow-right"
                          iconPos="right"
                          [label]="banner.linkLabel || 'Ver más'"
                        >
                          <span pButtonLabel>Router Link</span>
                        </a>
                      } @else {
                        <a
                          [href]="url"
                          pButton
                          target="_blank"
                          rel="noopener noreferrer"
                          icon="pi pi-arrow-up-right"
                          iconPos="right"
                          [label]="banner.linkLabel || 'Ver más'"
                        >
                        </a>
                      }
                    </div>
                  }
                </div>
              </article>
            </ng-template>
          </p-carousel>
        </div>
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class FeaturedBannersSection {
  readonly items = input.required<FeaturedBanner[]>();

  readonly hasMultipleItems = computed(() => this.items().length > 1);

  readonly autoplayInterval = computed(() =>
    this.hasMultipleItems() ? 7000 : 0,
  );

  isInternalUrl(url: string): boolean {
    return url.startsWith('/');
  }

  validUrl(url: string | null): string | null {
    if (!url) return null;
    return this.isInternalUrl(url) || /^https?:\/\//i.test(url) ? url : null;
  }
}
