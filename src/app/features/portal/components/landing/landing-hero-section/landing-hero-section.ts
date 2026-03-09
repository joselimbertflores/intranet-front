import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'landing-hero-section',
  imports: [],
  template: `
    <section
      class="relative overflow-hidden border-b border-surface-200/70 bg-linear-to-br from-primary-100 via-surface-0 to-primary-200/60 py-20 sm:py-24 lg:py-28"
    >
      <div class="pointer-events-none absolute inset-0">
        <div
          class="absolute -left-10 top-12 h-48 w-48 rounded-full bg-primary-300/25 blur-3xl"
        ></div>
        <div
          class="absolute right-0 top-0 h-72 w-72 rounded-full bg-primary-500/12 blur-3xl"
        ></div>
        <div
          class="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-surface-0/90 blur-2xl"
        ></div>
      </div>

      <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          class="flex flex-col-reverse items-center gap-12 md:flex-row md:gap-16"
        >
          <div
            class="flex flex-1 flex-col items-center text-center md:items-start md:text-left"
          >
            <p
              class="inline-flex rounded-full border border-primary-200/80 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-primary-700 shadow-sm backdrop-blur-sm"
            >
              Portal institucional
            </p>

            <p class="mt-4 text-sm font-medium tracking-[0.02em] text-surface-600">
              Gobierno Aut&oacute;nomo Municipal de Sacaba
            </p>

            <div class="mt-7 flex items-center gap-4">
              <img
                src="images/icons/app.webp"
                alt="Intranet"
                class="h-16 w-16 rounded-2xl border border-white/70 bg-white/85 p-2 object-contain shadow-sm backdrop-blur-sm"
              />

              <h1
                class="text-4xl font-black tracking-tight text-surface-950 sm:text-5xl lg:text-6xl"
              >
                Intranet
              </h1>
            </div>

            <p
              class="mt-6 max-w-2xl text-base leading-8 text-surface-700 sm:text-lg"
            >
              Acceda de forma centralizada a comunicados, documentos, calendario
              institucional, tutoriales y servicios internos desde una
              experiencia limpia, consistente y optimizada para escritorio y
              m&oacute;vil.
            </p>
          </div>

          <div class="flex flex-1 justify-center md:justify-end">
            <div
              class="relative rounded-[2rem] border border-white/60 bg-white/55 px-8 py-6 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)] backdrop-blur-sm"
            >
              <div
                class="absolute inset-0 rounded-[2rem] bg-linear-to-br from-white/70 via-transparent to-primary-100/30"
              ></div>

              <img
                src="images/institution/alcaldia.webp"
                alt="Gobierno Aut&oacute;nomo Municipal de Sacaba"
                class="relative h-20 w-auto object-contain sm:h-32"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingHeroSection {}
