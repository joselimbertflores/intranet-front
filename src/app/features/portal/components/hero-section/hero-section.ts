import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-hero-section',
  imports: [],
  template: `
    <section
      class="relative w-full overflow-hidden bg-surface border-b border-surface"
    >
      <!-- fondo sutil con color institucional -->
      <div
        class="absolute inset-0 bg-linear-to-r from-primary/5 via-transparent to-transparent"
      ></div>

      <div class="relative max-w-7xl mx-auto px-6 py-20">
        <div class="flex flex-col gap-6">
          <!-- Marca / identidad -->
          <div class="flex items-center gap-4">
            <!-- Logo institución -->
            <img
              src="images/institution/alcaldia.webp"
              alt="Institución"
              class="h-12 w-auto"
            />

            <!-- Separador -->
            <div class="h-10 w-px bg-surface-border"></div>

            <!-- Icono del sistema -->
            <div class="flex items-center gap-2">
              <div
                class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"
              >
                <!-- puede ser svg o icono -->
                <span class="text-primary font-semibold text-lg">I</span>
              </div>
              <span class="text-lg font-semibold text-color"> Intranet </span>
            </div>
          </div>

          <!-- Texto principal -->
          <div class="max-w-3xl">
            <h1
              class="text-4xl md:text-5xl font-semibold text-color leading-tight"
            >
              Plataforma interna institucional
            </h1>

            <p class="mt-4 text-lg text-color-secondary leading-relaxed">
              Acceso centralizado a documentos oficiales, comunicados internos,
              sistemas institucionales y recursos administrativos.
            </p>
          </div>

          <!-- Línea visual de cierre -->
          <div class="pt-4">
            <div class="h-1 w-20 bg-primary rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSection {}
