import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { RouterModule } from '@angular/router';

import { CarouselModule } from 'primeng/carousel';

import { PortalCommunicationResponse } from '../../../../interfaces';

@Component({
  selector: 'landing-communications-section',
  imports: [CommonModule, RouterModule, CarouselModule],
  template: `
    <section class="border-y border-surface-200/70 bg-surface-50/60 py-16 md:py-20">
      <div class="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <header
          class="mb-9 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between md:mb-10"
        >
          <h2
            class="text-3xl font-semibold tracking-tight text-surface-950 sm:text-4xl"
          >
            Comunicados recientes
          </h2>

          <a
            routerLink="/communications"
            class="group inline-flex w-fit items-center gap-2 rounded-lg border border-surface-300 bg-surface-0 px-4 py-2.5 text-sm font-semibold text-surface-800 shadow-sm transition duration-200 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
          >
            Ver todos
            <i
              class="pi pi-arrow-right text-xs transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            ></i>
          </a>
        </header>

        <p-carousel
          [value]="items()"
          [numVisible]="numVisible"
          [numScroll]="1"
          [circular]="items().length > 3"
          [showIndicators]="items().length > 1"
          [showNavigators]="items().length > 3"
          [responsiveOptions]="responsiveOptions()"
          [ngClass]="{
            'single-item-carousel': items().length === 1,
            'two-item-carousel': items().length === 2,
          }"
          aria-label="Comunicados recientes"
        >
          <ng-template pTemplate="item" let-item>
            <div class="flex justify-center px-2 py-3 sm:px-3">
              <a
                [routerLink]="['/communications', item.id]"
                [attr.aria-label]="'Abrir comunicado: ' + item.reference"
                class="group flex h-[34rem] w-full max-w-[22rem] flex-col overflow-hidden rounded-xl border border-surface-200 bg-surface-0 shadow-[0_1px_2px_rgb(15_23_42/0.05)] transition duration-300 ease-out hover:-translate-y-1 hover:border-surface-300 hover:shadow-[0_14px_32px_-18px_rgb(15_23_42/0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
              >
                <div
                  class="relative flex h-[22.75rem] shrink-0 items-center justify-center overflow-hidden border-b border-surface-200 bg-surface-100 p-4 sm:p-5"
                >
                  @if (item.previewImageUrl) {
                    <img
                      [src]="item.previewImageUrl"
                      [alt]="'Vista previa de ' + item.reference"
                      class="h-full w-auto max-w-full rounded-sm object-contain shadow-[0_8px_20px_-10px_rgb(15_23_42/0.4)] transition-transform duration-300 group-hover:scale-[1.015] motion-reduce:transform-none motion-reduce:transition-none"
                    />
                  } @else {
                    <div
                      class="relative flex aspect-[8.5/11] h-full max-w-full flex-col overflow-hidden rounded-sm border border-surface-200 bg-surface-0 px-5 py-6 shadow-[0_8px_20px_-10px_rgb(15_23_42/0.3)]"
                      aria-label="Vista previa no disponible"
                    >
                      <div class="mb-8 h-1 w-10 rounded-full bg-primary-600"></div>
                      <div class="space-y-2" aria-hidden="true">
                        <div class="h-1.5 w-4/5 rounded-full bg-surface-200"></div>
                        <div class="h-1.5 w-full rounded-full bg-surface-100"></div>
                        <div class="h-1.5 w-3/5 rounded-full bg-surface-100"></div>
                      </div>
                      <div class="mt-auto flex items-end justify-between">
                        <div>
                          <i
                            class="pi pi-file-pdf text-3xl text-primary-700"
                            aria-hidden="true"
                          ></i>
                          <p
                            class="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-surface-500"
                          >
                            Documento PDF
                          </p>
                        </div>
                        <span
                          class="rounded border border-surface-200 px-2 py-1 text-[9px] font-semibold uppercase text-surface-400"
                        >
                          Sin preview
                        </span>
                      </div>
                    </div>
                  }
                </div>

                <div class="flex min-h-0 flex-1 flex-col p-5">
                  <div class="mb-3 flex min-w-0 items-center gap-2">
                    <span
                      class="max-w-full truncate rounded-md bg-primary-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-800"
                    >
                      {{ item.type }}
                    </span>
                    @if (item.code) {
                      <span
                        class="min-w-0 truncate border-l border-surface-200 pl-2 text-[11px] font-semibold text-surface-500"
                        [title]="item.code"
                      >
                        {{ item.code }}
                      </span>
                    }
                  </div>

                  <h3
                    class="line-clamp-3 text-[15px] font-semibold leading-5 text-surface-900 transition-colors duration-200 group-hover:text-primary-800"
                    [title]="item.reference"
                  >
                    {{ item.reference }}
                  </h3>

                  <div
                    class="mt-auto flex items-center justify-between border-t border-surface-100 pt-3 text-xs text-surface-500"
                  >
                    <time [attr.datetime]="item.createdAt">
                      {{ item.createdAt | date: 'dd/MM/yyyy' }}
                    </time>
                    <span
                      class="flex h-7 w-7 items-center justify-center rounded-full bg-surface-100 text-primary-700 transition-colors duration-200 group-hover:bg-primary-700 group-hover:text-white"
                      aria-hidden="true"
                    >
                      <i class="pi pi-arrow-right text-[10px]"></i>
                    </span>
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
    :host {
      display: block;
    }

    .single-item-carousel {
      display: block;
      max-width: 24rem;
      margin-inline: auto;
    }

    .two-item-carousel {
      display: block;
      max-width: 48rem;
      margin-inline: auto;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingCommunicationsSection {
  readonly items = input.required<PortalCommunicationResponse[]>();

  readonly responsiveOptions = computed(() => {
    const itemCount = this.items().length;

    return [
      {
        breakpoint: '1024px',
        numVisible: Math.min(itemCount, 2),
        numScroll: 1,
      },
      {
        breakpoint: '640px',
        numVisible: Math.min(itemCount, 1),
        numScroll: 1,
      },
    ];
  });

  get numVisible(): number {
    return Math.min(this.items().length, 3);
  }
}
