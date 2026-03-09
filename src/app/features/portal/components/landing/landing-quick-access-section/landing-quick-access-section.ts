import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { QuickAccessResponse } from '../../../../administration/content-settings/interfaces';

@Component({
  selector: 'landing-quick-access-section',
  imports: [],
  template: `
    <section class="relative py-14 sm:py-16 lg:py-20">
      <div class="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <div class="mb-8 max-w-2xl sm:mb-10">
          <span
            class="inline-flex rounded-full border border-primary-200/80 bg-primary-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary-700"
          >
            Sistemas
          </span>

          <h2
            class="mt-4 text-3xl font-semibold tracking-tight text-surface-950 sm:text-4xl"
          >
            Accesos Directos
          </h2>

          <p class="mt-3 max-w-xl text-sm leading-7 text-surface-600 sm:text-base">
            Sistemas y plataformas del ecosistema digital institucional.
          </p>
        </div>

        <div
          class="grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
          @for (item of items(); track item.id) {
            <a
              [href]="item.url"
              target="_blank"
              rel="noopener noreferrer"
              [attr.aria-label]="'Abrir ' + item.name"
              class="group relative flex h-full min-h-[13.5rem] flex-col overflow-hidden rounded-3xl border border-surface-200/80 bg-white/90 p-5 shadow-[0_20px_55px_-40px_rgba(15,23,42,0.35)] ring-1 ring-white/60 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-primary-200 hover:shadow-[0_28px_70px_-38px_rgba(37,99,235,0.32)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              <div
                class="absolute inset-0 bg-linear-to-b from-white/80 via-transparent to-surface-50/70"
              ></div>

              <div
                class="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                [style.background]="
                  'radial-gradient(circle at 50% 0%, ' +
                  item.color +
                  '20, transparent 60%)'
                "
              ></div>

              <div
                class="relative z-10 mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-surface-200 bg-white/90 shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-primary-200"
              >
                <i
                  [class]="item.icon"
                  [style.color]="item.color"
                  class="text-[26px] transition-transform duration-300 ease-out group-hover:scale-110"
                ></i>
              </div>

              <div class="relative z-10 mt-auto flex flex-col gap-1.5">
                <h3
                  class="text-sm font-semibold text-surface-800 transition-colors duration-300 group-hover:text-surface-950 sm:text-[0.95rem]"
                >
                  {{ item.name }}
                </h3>

                <p
                  class="line-clamp-2 text-xs leading-6 text-surface-600"
                >
                  {{ item?.description || 'Acceso al sistema.' }}
                </p>

                <div
                  class="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-primary-700 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
                >
                  Abrir sistema
                  <i class="pi pi-arrow-up-right text-[10px]"></i>
                </div>
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
