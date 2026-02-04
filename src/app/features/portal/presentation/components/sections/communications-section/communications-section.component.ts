import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { AnimateOnScroll } from 'primeng/animateonscroll';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'communications-section',
  imports: [
    RouterModule,
    CommonModule,
    CarouselModule,
    ButtonModule,
    AnimateOnScroll,
  ],
  template: `
    <section
      class="relative py-20 text-white"
      pAnimateOnScroll
      enterClass="animate-enter fade-in-20 slide-in-from-b-20 animate-duration-1000"
      [once]="true"
      [threshold]="0.1"
    >
      <div
        class="absolute inset-0 bg-linear-to-br from-primary-400 via-primary-700 to-surface-900"
      ></div>

      <div
        class="absolute -top-20 -left-40 w-[600px] h-[600px] bg-primary-200/15 rounded-full blur-3xl animate-float"
      ></div>
      <div
        class="absolute top-40 right-0 w-[500px] h-[500px] bg-surface-100/20 rounded-full blur-3xl animate-float"
      ></div>

      <div class="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <h2 class="text-xl sm:text-4xl font-semibold mb-3 text-white">
          Comunicados
        </h2>
        <p class="text-primary-100 mx-auto mb-12 text-sm sm:text-xl">
          Mantente informado con los últimos comunicados institucionales.
        </p>
        <p-carousel
          [value]="communications()"
          [numVisible]="3"
          [numScroll]="1"
          [circular]="true"
          [autoplayInterval]="4000"
          [responsiveOptions]="responsiveOptions"
        >
          <ng-template pTemplate="item" let-com>
            <a
              class="relative block m-2 overflow-hidden rounded-2xl shadow-lg bg-white cursor-pointer transition-all duration-300 hover:-translate-y-2"
              [routerLink]="['communications', com.id]"
              pAnimateOnScroll
              enterClass="animate-enter fade-in-20 zoom-in-75 slide-in-from-b-10 animate-duration-1000"
              [once]="true"
              [threshold]="0.15"
            >
              <div class="absolute top-2 right-2 z-20">
                <span
                  class="text-sm font-semibold text-white bg-primary-800/90 px-2 py-1 rounded-md shadow-sm"
                >
                  {{ com.type.name }}
                </span>
              </div>

              <div class="relative">
                <img
                  [src]="com.previewUrl"
                  [alt]="com.reference"
                  class="w-full h-[350px] sm:h-[520px] object-cover object-top bg-surface-100"
                />
                <div
                  class="absolute bottom-0 left-0 right-0 p-5 bg-linear-to-t from-black/95 via-black/70 to-transparent backdrop-blur-[2px]"
                >
                  <p class="text-sm text-white mb-1">
                    {{ com.publicationDate | date: 'd MMMM, y' }}
                  </p>
                  <h3
                    class="text-lg font-semibold leading-snug text-white line-clamp-2"
                  >
                    {{ com.reference }}
                  </h3>
                  <p class="text-xs opacity-80 text-white truncate">
                    Cite: {{ com.code }}
                  </p>
                </div>
              </div>
            </a>
          </ng-template>
        </p-carousel>

        <div class="text-center mt-10 animate-enter">
          <a routerLink="communications" pButton [rounded]="true">
            <span pButtonLabel>Ver más comunicados</span>
            <i class="pi pi-arrow-right" pButtonIcon></i>
          </a>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunicationsSectionComponent {
  communications = input.required<any[]>();
  readonly responsiveOptions = [
    {
      breakpoint: '1400px',
      numVisible: 2,
      numScroll: 1,
    },
    {
      breakpoint: '1199px',
      numVisible: 2,
      numScroll: 1,
    },
    {
      breakpoint: '767px',
      numVisible: 2,
      numScroll: 1,
    },
    {
      breakpoint: '575px',
      numVisible: 1,
      numScroll: 1,
    },
  ];
}
