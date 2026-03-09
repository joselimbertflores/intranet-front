import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CarouselModule } from 'primeng/carousel';
import { PortalCommunicationResponse } from '../../../interfaces';

@Component({
  selector: 'landing-communications-section',
  imports: [RouterModule, CommonModule, CarouselModule],
  template: `
    <section class="py-14 sm:py-16 lg:py-20">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div
          class="mb-8 flex flex-col gap-6 md:mb-10 md:flex-row md:items-end md:justify-between"
        >
          <div class="max-w-3xl">
            <span
              class="inline-flex rounded-full border border-primary-200/80 bg-primary-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary-700"
            >
              Comunicados
            </span>

            <h2
              class="mt-4 text-3xl font-semibold tracking-tight text-surface-950 sm:text-4xl"
            >
              Publicaciones recientes
            </h2>

            <p class="mt-3 max-w-2xl text-sm leading-7 text-surface-600 sm:text-base">
              Avisos, resoluciones y comunicados oficiales con acceso r&aacute;pido
              a sus detalles.
            </p>
          </div>

          <a
            routerLink="/communications"
            class="inline-flex items-center gap-2 rounded-full border border-surface-200/90 bg-surface-0/95 px-5 py-2.5 text-sm font-semibold text-surface-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:bg-primary-50/60 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            Ver todos
            <i class="pi pi-arrow-right text-xs"></i>
          </a>
        </div>

        <div
          class="rounded-[2rem] border border-surface-200/80 bg-surface-0/85 p-1 shadow-[0_24px_70px_-50px_rgba(15,23,42,0.25)]"
        >
          <p-carousel
            [value]="communications()"
            [numVisible]="numVisible"
            [numScroll]="1"
            [circular]="communications().length > 4"
            [showIndicators]="communications().length > 1"
            [showNavigators]="communications().length > 4"
            [responsiveOptions]="responsiveOptions"
            [ngClass]="{
              'carousel-center': communications().length <= 2,
            }"
          >
            <ng-template pTemplate="item" let-item>
              <div class="flex justify-center p-3">
                <a
                  [routerLink]="['/communications', item.id]"
                  class="group flex h-full w-full max-w-[320px] flex-col overflow-hidden rounded-[1.5rem] border border-surface-200/80 bg-surface-0 shadow-[0_20px_45px_-38px_rgba(15,23,42,0.4)] transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-[0_28px_70px_-36px_rgba(37,99,235,0.3)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  <div
                    class="relative h-72 overflow-hidden border-b border-surface-100 bg-surface-100"
                  >
                    @if (item.previewImageUrl) {
                      <img
                        [src]="item.previewImageUrl"
                        [alt]="item.reference"
                        class="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                    } @else {
                      <div
                        class="flex h-full items-center justify-center bg-linear-to-b from-surface-50 to-surface-100"
                      >
                        <i class="pi pi-file-pdf text-5xl text-surface-300"></i>
                      </div>
                    }

                    <div
                      class="pointer-events-none absolute inset-0 bg-linear-to-t from-surface-950/20 via-transparent to-transparent"
                    ></div>

                    <span
                      class="absolute left-3 top-3 rounded-full bg-surface-0/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-surface-700 shadow-sm backdrop-blur-sm"
                    >
                      {{ item.type }}
                    </span>
                  </div>

                  <div class="flex flex-1 flex-col gap-4 p-5">
                    <div
                      class="inline-flex w-fit rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-semibold text-primary-700"
                    >
                      COD: {{ item.code }}
                    </div>

                    <h3
                      class="line-clamp-3 text-sm font-semibold leading-6 text-surface-900 transition-colors group-hover:text-primary-700"
                    >
                      {{ item.reference }}
                    </h3>

                    <div
                      class="mt-auto flex items-center justify-between border-t border-surface-100 pt-3 text-xs text-surface-500"
                    >
                      <span class="flex items-center gap-1.5">
                        <i class="pi pi-calendar text-primary-500"></i>
                        {{ item.createdAt | date: 'dd MMM yyyy' }}
                      </span>

                      <span
                        class="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-600 transition-all duration-300 group-hover:translate-x-0.5 group-hover:bg-primary-100"
                      >
                        <i class="pi pi-arrow-right text-xs"></i>
                      </span>
                    </div>
                  </div>
                </a>
              </div>
            </ng-template>
          </p-carousel>
        </div>
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .carousel-center .p-carousel-items-content {
      justify-content: center;
    }

    :host ::ng-deep .p-carousel .p-carousel-indicator button {
      width: 0.65rem;
      height: 0.65rem;
      border-radius: 999px;
      opacity: 1;
      background: color-mix(in srgb, var(--p-primary-color) 24%, white);
    }

    :host ::ng-deep .p-carousel .p-carousel-indicator.p-highlight button {
      width: 1.75rem;
      background: var(--p-primary-color);
    }

    :host ::ng-deep .p-carousel .p-carousel-prev,
    :host ::ng-deep .p-carousel .p-carousel-next {
      width: 2.75rem;
      height: 2.75rem;
      border-radius: 999px;
      border: 1px solid var(--p-surface-200);
      background: rgba(255, 255, 255, 0.96);
      color: var(--p-surface-700);
      box-shadow: 0 16px 38px -26px rgba(15, 23, 42, 0.35);
      transition:
        transform 0.2s ease,
        border-color 0.2s ease,
        color 0.2s ease,
        background-color 0.2s ease;
    }

    :host ::ng-deep .p-carousel .p-carousel-prev:not(:disabled):hover,
    :host ::ng-deep .p-carousel .p-carousel-next:not(:disabled):hover {
      transform: translateY(-1px);
      border-color: color-mix(in srgb, var(--p-primary-color) 35%, white);
      color: var(--p-primary-color);
      background: color-mix(in srgb, var(--p-primary-color) 8%, white);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingCommunicationsSection {
  communications = input.required<PortalCommunicationResponse[]>();

  responsiveOptions = [
    {
      breakpoint: '1280px',
      numVisible: 3,
      numScroll: 1,
    },
    {
      breakpoint: '1024px',
      numVisible: 2,
      numScroll: 1,
    },
    {
      breakpoint: '768px',
      numVisible: 2,
      numScroll: 1,
    },
    {
      breakpoint: '640px',
      numVisible: 1,
      numScroll: 1,
    },
  ];

  get numVisible() {
    return Math.min(this.communications().length, 3);
  }
}
