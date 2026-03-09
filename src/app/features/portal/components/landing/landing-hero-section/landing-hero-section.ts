import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'landing-hero-section',
  imports: [],
  template: `
    <section
      class="relative overflow-hidden bg-linear-to-br from-primary-50/80 via-surface-0 to-primary-100/40 pt-24 pb-20 md:pt-32 md:pb-28 border-b border-surface-200/50"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          class="flex flex-col-reverse md:flex-row items-center gap-12 md:gap-16"
        >
          <!-- Left -->
          <div
            class="flex-1 flex flex-col items-center md:items-start text-center md:text-left"
          >
            <!-- Institutional context -->
            <p
              class="text-xs font-semibold uppercase tracking-widest text-primary-700"
            >
              Portal institucional
            </p>

            <p class="text-sm text-surface-600 mt-1">
              Gobierno Autónomo Municipal de Sacaba
            </p>

            <!-- System identity -->
            <div class="flex items-center gap-4 mt-6">
              <img
                src="images/icons/app.webp"
                alt="Intranet"
                class="h-16 w-16 object-contain"
              />

              <h1
                class="text-5xl sm:text-6xl md:text-7xl font-extrabold text-surface-950 tracking-tight"
              >
                Intranet
              </h1>
            </div>

            <!-- Description -->
            <p
              class="mt-6 max-w-2xl text-base leading-relaxed text-surface-700 sm:text-lg"
            >
              Acceda de forma centralizada a comunicados, documentos, calendario
              institucional, tutoriales y servicios internos desde una
              experiencia limpia, consistente y optimizada para escritorio y
              móvil.
            </p>
          </div>
          <!-- Right -->
          <div class="flex-1 flex justify-center md:justify-end">
            <img
              src="images/institution/alcaldia.webp"
              alt="Gobierno Autónomo Municipal de Sacaba"
              class="h-20 w-auto object-contain sm:h-32"
            />
          </div>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingHeroSection {}
