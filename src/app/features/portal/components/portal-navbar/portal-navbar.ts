import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'portal-navbar',
  imports: [],
  template: `
    <header
      class="fixed top-0 inset-x-0 z-50 bg-surface/80 backdrop-blur border-b border-surface-200"
    >
      <div
        class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between"
      >
        <!-- Brand -->
        <div class="flex items-center gap-3">
          <img
            src="images/icons/app.png"
            alt="Portal institucional"
            class="w-9 h-9"
          />
          <div class="leading-tight hidden sm:block">
            <p class="text-sm font-semibold text-color">Portal Institucional</p>
            <p class="text-xs text-color-secondary">
              Gobierno Autónomo Municipal
            </p>
          </div>
        </div>

        <!-- Desktop menu -->
        <nav class="hidden md:flex items-center gap-6 text-sm font-medium">
          <a class="text-primary" href="#">Inicio</a>
          <a class="text-color hover:text-primary transition" href="#">
            Documentos
          </a>
          <a class="text-color hover:text-primary transition" href="#">
            Comunicados
          </a>

          <!-- Servicios -->
          <div class="relative group">
            <button
              class="flex items-center gap-1 text-color hover:text-primary transition"
            >
              Servicios
              <span class="text-xs">▾</span>
            </button>

            <div
              class="absolute top-full left-0 mt-2 w-48 bg-surface border border-surface-200 rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition"
            >
              <a class="block px-4 py-2 text-sm hover:bg-surface-100" href="#">
                Calendario
              </a>
              <a class="block px-4 py-2 text-sm hover:bg-surface-100" href="#">
                Tutoriales
              </a>
              <a class="block px-4 py-2 text-sm hover:bg-surface-100" href="#">
                Directorio
              </a>
            </div>
          </div>
        </nav>

        <!-- Mobile button -->
        <button
          class="md:hidden p-2 rounded-lg hover:bg-surface-100 transition"
          aria-label="Abrir menú"
        >
          ☰
        </button>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortalNavbar {}
