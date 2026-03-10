import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'landing-hero-section',
  imports: [],
  template: `
    <section
      class="relative overflow-hidden bg-linear-to-br from-primary-100/80 via-surface-0 to-primary-200/40 pt-24 pb-20 md:pt-32 md:pb-28 border-b border-surface-200/50"
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
              class="hero-reveal hero-delay-1 text-xs font-semibold uppercase tracking-widest text-primary-700"
            >
              Portal institucional
            </p>

            <p class="hero-reveal hero-delay-2 mt-1 text-sm text-surface-600">
              Gobierno Autónomo Municipal de Sacaba
            </p>

            <!-- System identity -->
            <div class="flex items-center gap-4 mt-6">
              <img
                src="images/icons/app.webp"
                alt="Intranet"
                class="hero-scale-in hero-delay-3 h-16 w-16 object-contain"
              />

              <h1
                class="hero-reveal hero-delay-4 text-5xl sm:text-6xl md:text-7xl font-bold text-surface-950 tracking-tight"
              >
                Intranet
              </h1>
            </div>

            <!-- Description -->
            <p
              class="hero-reveal hero-delay-5 mt-6 max-w-2xl text-base leading-relaxed text-surface-700 sm:text-lg"
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
              class="hero-logo hero-delay-6 h-20 w-auto object-contain sm:h-32"
            />
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .hero-reveal,
    .hero-scale-in,
    .hero-logo {
      opacity: 0;
      will-change: transform, opacity;
    }

    .hero-reveal {
      animation: hero-fade-up 0.72s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }

    .hero-scale-in {
      animation: hero-scale-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }

    .hero-logo {
      animation: hero-logo-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }

    .hero-delay-1 {
      animation-delay: 80ms;
    }

    .hero-delay-2 {
      animation-delay: 160ms;
    }

    .hero-delay-3 {
      animation-delay: 240ms;
    }

    .hero-delay-4 {
      animation-delay: 320ms;
    }

    .hero-delay-5 {
      animation-delay: 420ms;
    }

    .hero-delay-6 {
      animation-delay: 520ms;
    }

    @keyframes hero-fade-up {
      from {
        opacity: 0;
        transform: translate3d(0, 1.25rem, 0);
      }

      to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
      }
    }

    @keyframes hero-scale-in {
      from {
        opacity: 0;
        transform: translate3d(0, 1rem, 0) scale(0.94);
      }

      to {
        opacity: 1;
        transform: translate3d(0, 0, 0) scale(1);
      }
    }

    @keyframes hero-logo-in {
      from {
        opacity: 0;
        transform: translate3d(0, 1rem, 0) scale(0.96);
      }

      to {
        opacity: 1;
        transform: translate3d(0, 0, 0) scale(1);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .hero-reveal,
      .hero-scale-in,
      .hero-logo {
        animation: none !important;
        opacity: 1 !important;
        transform: none !important;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingHeroSection {}
