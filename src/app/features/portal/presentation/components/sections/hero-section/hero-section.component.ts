import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { HeroSlideResponse } from '../../../../../administration/content-settings/interfaces';

@Component({
  selector: 'hero-section',
  imports: [RouterModule, CarouselModule, ButtonModule],
  template: `
    <section class="bg-surface-0 border-b border-surface-200 py-4">
      <div
        class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-4 md:px-8
           animate-enter fade-in-20 slide-in-from-t-10 animate-duration-700"
      >
        <div class="flex items-center gap-4 text-center md:text-left">
          <img
            src="images/icons/app.png"
            alt="Logo app"
            class="h-14 w-auto hidden md:block"
          />
          <div>
            <h1
              class="text-xl md:text-3xl font-extrabold text-primary-700 tracking-tight"
            >
              Intranet
            </h1>
            <p class="text-sm md:text-lg text-surface-600 font-medium">
              Gobierno Autónomo Municipal de Sacaba
            </p>
          </div>
        </div>
        <img
          src="images/icons/alcaldia.png"
          alt="Logo Municipio"
          class="h-16 md:h-20 hidden md:block"
        />
      </div>
    </section>

    <section
      class="relative animate-enter fade-in-10 slide-in-from-t-10 animate-duration-1000"
    >
      <p-carousel
        [value]="slides() ?? []"
        [numVisible]="1"
        [numScroll]="1"
        [autoplayInterval]="6000"
        circular
        [showIndicators]="true"
        [showNavigators]="true"
        [contentClass]="'w-full bg-black'"
      >
        <ng-template let-slide pTemplate="item">
          <div
            class="relative h-[500px] md:h-[600px] bg-cover bg-center transition-all duration-700"
            [style.backgroundImage]="'url(' + slide.imageUrl + ')'"
          >
            <div
              class="absolute inset-0 bg-linear-to-r from-black/70 via-black/50 to-transparent
                 flex flex-col justify-center text-white px-6 md:px-16 space-y-4"
            >
              <h2
                class="text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-lg max-w-3xl
                   animate-enter fade-in-20 slide-in-from-t-10 animate-duration-1000"
              >
                {{ slide.title }}
              </h2>

              <p
                class="max-w-2xl text-lg md:text-2xl opacity-90 line-clamp-3 animate-enter fade-in-20 slide-in-from-b-10 animate-duration-1000"
              >
                {{ slide.description }}
              </p>

              @if (slide.redirectUrl) {
              <a
                pButton
                class="w-[150px] animate-enter fade-in-20 slide-in-from-b-10 animate-duration-1000"
                rounded="true"
                [routerLink]="'admin'"
              >
                <span pButtonLabel>Saber más</span>
                <i pButtonIcon class="pi pi-arrow-right"></i>
              </a>
              }
            </div>
          </div>
        </ng-template>
      </p-carousel>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSectionComponent {
  slides = input<HeroSlideResponse[]>();
}
