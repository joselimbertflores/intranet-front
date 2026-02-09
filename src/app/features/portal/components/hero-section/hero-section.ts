import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-hero-section',
  imports: [],
  template: `
    <section class="bg-surface-ground pt-28 pb-24">
      <div
        class="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
      >
        <!-- Texto -->
        <div class="space-y-6">
          <!-- Badge -->
          <span
            class="inline-flex items-center px-4 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
          >
            Portal institucional
          </span>

          <!-- Título -->
          <h1
            class="text-4xl lg:text-5xl font-semibold text-color leading-tight"
          >
            Portal Público del
            <span class="text-primary"> Gobierno Autónomo Municipal </span>
          </h1>

          <!-- Subtítulo -->
          <p class="text-base lg:text-lg text-color-secondary max-w-xl">
            Acceda a información oficial, documentos, comunicados y servicios
            institucionales a través de una plataforma clara, moderna y
            accesible para la ciudadanía.
          </p>
        </div>

        <!-- Visual -->
        <div class="relative">
          <!-- Glow suave -->
          <div
            class="absolute -inset-8 bg-primary/10 blur-3xl rounded-full"
          ></div>

          <!-- Imagen -->
          <div
            class="relative bg-surface rounded-2xl shadow-lg overflow-hidden"
          >
            <img
              src="images/institution/sacaba.jpeg"
              alt="Institución pública"
              class="w-full h-80 object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSection {}
