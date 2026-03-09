import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { QuickAccessResponse } from '../../../../administration/content-settings/interfaces';

@Component({
  selector: 'landing-quick-access-section',
  imports: [],
  template: `
    <section class="py-16 md:py-24">
      <div class="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <!-- Section header -->
        <div class="mb-10 max-w-2xl">
          <h2
            class="text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl"
          >
            Accesos Directos
          </h2>

          <p class="mt-3 text-base text-surface-600">
            Sistemas y plataformas del ecosistema digital institucional.
          </p>
        </div>

        <!-- Grid -->
        <div
          class="grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-3 lg:grid-cols-4"
        >
          @for (item of items(); track item.id) {
            <a
              [href]="item.url"
              target="_blank"
              rel="noopener noreferrer"
              [attr.aria-label]="'Abrir ' + item.name"
              class="group relative flex flex-col overflow-hidden rounded-2xl bg-surface-0 p-5 shadow-sm hover:shadow-md ring-1 ring-surface-200 hover:ring-surface-300 transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-surface-0/80 focus:outline-none"
            >

              <!-- Hover glow -->
              <div
                class="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                [style.background]="
                  'radial-gradient(circle at 50% 0%, ' +
                  item.color +
                  '20, transparent 60%)'
                "
              ></div>

              <!-- Icon -->
              <div
                class="relative z-10 mb-5 h-14 w-14 flex items-center justify-center rounded-xl border border-surface-200 bg-surface-50"
              >
                <i
                  [class]="item.icon"
                  [style.color]="item.color"
                  class="text-[26px] transition-transform duration-300 ease-out group-hover:scale-110"
                ></i>
              </div>

              <!-- Text -->
              <div class="relative z-10 flex flex-col gap-1.5 mt-auto">
                <h3
                  class="text-sm font-bold text-surface-800 transition-colors duration-300 group-hover:text-surface-950"
                >
                  {{ item.name }}
                </h3>

                <p
                  class="text-xs leading-relaxed text-surface-600 line-clamp-2"
                >
                  {{ item?.description || 'Acceso al sistema.' }}
                </p>
              </div>
            </a>
          }
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingQuickAccessSection {
  items = input.required<QuickAccessResponse[]>();
}
