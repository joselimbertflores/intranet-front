import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { AnimateOnScroll } from 'primeng/animateonscroll';

import { QuickAccess } from '../../../../models';

@Component({
  selector: 'landing-quick-access-section',
  imports: [AnimateOnScroll],
  template: `
    <section
      class="py-16 md:py-24"
      pAnimateOnScroll
      enterClass="animate-enter fade-in slide-in-from-b-6 animate-duration-500"
      [once]="true"
    >
      <div class="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
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

        <div
          class="grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-3 lg:grid-cols-4"
        >
          @for (item of items(); track item.id) {
            <a
              [href]="item.url"
              target="_blank"
              rel="noopener noreferrer"
              [attr.aria-label]="
                'Abrir ' + item.title + ' en una nueva pestaña'
              "
              class="group flex min-h-52 flex-col rounded-2xl bg-surface-0 p-5 shadow-sm ring-1 ring-surface-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:ring-primary-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <div
                class="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-50 text-primary-600 ring-1 ring-primary-100"
              >
                <i
                  [class]="iconClass(item.iconKey)"
                  class="text-[26px] transition-transform duration-300 group-hover:scale-110"
                ></i>
              </div>

              <div class="flex flex-1 flex-col gap-1.5">
                <h3
                  class="text-sm font-bold text-surface-800 transition-colors duration-300 group-hover:text-primary-700"
                >
                  {{ item.title }}
                </h3>

                @if (item.description) {
                  <p
                    class="line-clamp-2 text-xs leading-relaxed text-surface-600"
                  >
                    {{ item.description }}
                  </p>
                }

                <i
                  class="pi pi-arrow-up-right mt-auto self-end text-sm text-surface-400 transition-colors group-hover:text-primary-600"
                  aria-hidden="true"
                ></i>
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
  readonly items = input.required<QuickAccess[]>();

  private readonly icons: Record<string, string> = {
    mail: 'pi pi-envelope',
    systems: 'pi pi-desktop',
    documents: 'pi pi-file',
    gaceta: 'pi pi-book',
    forms: 'pi pi-list-check',
    support: 'pi pi-question-circle',
  };

  iconClass(iconKey: string): string {
    return this.icons[iconKey] ?? 'pi pi-link';
  }
}
