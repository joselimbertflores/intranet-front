import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'portal-footer',
  imports: [],
  template: `
    <footer class="bg-surface-50 border-t border-surface-300/40 pt-12 pb-8">
      <div class="max-w-7xl mx-auto px-6">
        <div
          class="flex flex-col md:flex-row items-center md:justify-between gap-8"
        >
          <div
            class="flex flex-col items-center md:items-start text-center md:text-left max-w-md"
          >
            <img
              src="images/institution/slogan.png"
              alt="Gobierno Autónomo Municipal de Sacaba"
              class="h-16 sm:h-20 w-auto object-contain"
            />
          </div>

          <div
            class="flex flex-col items-center md:items-end text-center md:text-right"
          >
            <h2
              class="text-slate-800 font-semibold text-lg tracking-tight mb-1"
            >
              Gobierno Autónomo Municipal de Sacaba
            </h2>
            <span
              class="text-primary-600 text-xs font-semibold uppercase tracking-widest mb-3"
            >
              Jefatura de Gobierno Electrónico
            </span>
            <p class="text-slate-400 text-xs font-light">
              © {{ currentYear }} GAMS | Todos los derechos reservados
            </p>
          </div>
        </div>
      </div>
    </footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortalFooter {
  readonly currentYear: number = new Date().getFullYear();
}
