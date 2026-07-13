import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

import { QuickAccess } from '../../../../models';
import { quickAccessTone } from '../landing-presentation';

@Component({
  selector: 'landing-quick-access-section',
  template: `
    <section
      class="relative z-10 -mt-6 w-full rounded-t-[1.75rem] bg-surface-0 py-12 shadow-[0_-12px_30px_-24px_rgb(2_44_23/0.45)] sm:rounded-t-[2.25rem] sm:py-14 lg:py-16"
      aria-labelledby="quick-access-title"
    >
      <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <header class="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <h2
            id="quick-access-title"
            class="text-3xl font-extrabold tracking-[-0.025em] text-primary-900 sm:text-4xl"
          >
            Accesos rápidos
          </h2>
          <p class="mt-2 text-sm leading-6 text-surface-600 sm:text-base">
            Encuentra los recursos y servicios institucionales disponibles.
          </p>
        </header>

        <div
          class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5"
        >
          @for (entry of visualItems(); track entry.item.id) {
            <a
              [href]="entry.item.url"
              target="_blank"
              rel="noopener noreferrer"
              [attr.aria-label]="'Abrir ' + entry.item.title + ' en una nueva pestaña'"
              class="group relative flex min-h-40 flex-col items-center justify-center overflow-hidden rounded-2xl border p-4 text-center no-underline outline-none transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-surface-950/8 focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-3 motion-reduce:transform-none motion-reduce:transition-none sm:min-h-44 sm:p-5"
              [class]="entry.tone.card"
            >
              <span
                class="grid size-14 place-items-center rounded-2xl ring-1 ring-inset transition-transform duration-200 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none sm:size-16"
                [class]="entry.tone.icon"
                aria-hidden="true"
              >
                <i [class]="iconClass(entry.item.iconKey)" class="text-2xl sm:text-[1.75rem]"></i>
              </span>

              <h3 class="mt-4 text-sm font-bold leading-5 text-surface-900 sm:text-[0.95rem]">
                {{ entry.item.title }}
              </h3>

              @if (entry.item.description) {
                <p class="mt-1 line-clamp-2 text-xs leading-5 text-surface-600">
                  {{ entry.item.description }}
                </p>
              }

              <i
                class="pi pi-arrow-up-right absolute right-3 top-3 text-xs opacity-65 transition-opacity group-hover:opacity-100"
                [class]="entry.tone.arrow"
                aria-hidden="true"
              ></i>
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

  readonly visualItems = computed(() =>
    this.items().map((item) => ({
      item,
      tone: quickAccessTone(`${item.id}:${item.title}`),
    })),
  );

  private readonly icons: Readonly<Record<string, string>> = {
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
