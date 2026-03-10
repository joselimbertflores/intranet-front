import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


import { PortalCommunicationResponse } from '../../../../interfaces';

@Component({
  selector: 'landing-communications-section',
  imports: [RouterModule, CommonModule, CarouselModule],
  template: `
    <section class="py-16 md:py-24" pAnimateOnScroll>
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <!-- Header -->
        <div
          class="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
        >
          <div class="max-w-3xl">
            <span
              class="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-700 ring-1 ring-inset ring-primary-700/10"
            >
              Comunicados
            </span>

            <h2
              class="mt-4 text-3xl font-semibold tracking-tight text-surface-900 sm:text-4xl"
            >
              Publicaciones recientes
            </h2>

            <p class="mt-3 text-sm text-surface-600 sm:text-base">
              Avisos, resoluciones y comunicados oficiales con acceso rápido a
              sus detalles.
            </p>
          </div>

          <a
            routerLink="/communications"
            class="group inline-flex items-center gap-2 rounded-full ring-1 ring-inset ring-surface-200 bg-surface-0 px-5 py-2.5 text-sm font-semibold text-surface-700 shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:ring-surface-300 hover:bg-surface-50 hover:text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            Ver todos
            <i
              class="pi pi-arrow-right text-xs transition-transform duration-300 ease-out group-hover:translate-x-1"
            ></i>
          </a>
        </div>

        <!-- Carousel -->
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
                class="group flex w-full max-w-[320px] flex-col overflow-hidden rounded-2xl ring-1 ring-surface-200/80 bg-surface-0 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <!-- Preview -->
                <div
                  class="relative h-72 overflow-hidden bg-surface-100 border-b border-surface-100"
                >
                  @if (item.previewImageUrl) {
                    <img
                      [src]="item.previewImageUrl"
                      [alt]="item.reference"
                      class="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                  } @else {
                    <div
                      class="flex h-full items-center justify-center bg-surface-50"
                    >
                      <i class="pi pi-file-pdf text-5xl text-surface-300"></i>
                    </div>
                  }

                  <span
                    class="absolute left-3 top-3 rounded-md bg-surface-0/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-surface-700 shadow-sm"
                  >
                    {{ item.type }}
                  </span>
                </div>

                <!-- Content -->
                <div class="flex flex-col gap-3 p-5">
                  <div
                    class="inline-flex w-fit rounded bg-surface-100 px-2 py-0.5 text-[11px] font-semibold text-surface-600"
                  >
                    COD: {{ item.code }}
                  </div>

                  <h3
                    class="line-clamp-3 text-sm font-semibold leading-snug text-surface-900 transition-colors group-hover:text-primary-700"
                  >
                    {{ item.reference }}
                  </h3>

                  <div
                    class="mt-auto flex items-center justify-between text-xs text-surface-500"
                  >
                    <span class="flex items-center gap-1.5">
                      <i class="pi pi-calendar text-primary-500"></i>
                      {{ item.createdAt | date: 'dd MMM yyyy' }}
                    </span>

                    <i
                      class="pi pi-arrow-right text-primary-600 opacity-0 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:opacity-100"
                    ></i>
                  </div>
                </div>
              </a>
            </div>
          </ng-template>
        </p-carousel>
      </div>
    </section>
  `,
  styles: `
    .carousel-center .p-carousel-items-content {
      justify-content: center;
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
