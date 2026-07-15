import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { PortalCommunicationResponse } from '../../../../interfaces';
import { communicationTone } from '../landing-presentation';

@Component({
  selector: 'landing-communications-section',
  imports: [DatePipe, RouterLink],
  template: `
    <section
      class="w-full bg-surface-0 py-14 sm:py-16 lg:py-20"
      aria-labelledby="communications-title"
    >
      <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <header class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2
            id="communications-title"
            class="text-3xl font-extrabold tracking-[-0.025em] text-primary-900 sm:text-4xl"
          >
            Comunicados recientes
          </h2>

          <a
            routerLink="/communications"
            class="group inline-flex min-h-11 w-fit items-center gap-2 rounded-xl px-1 py-2 text-sm font-bold text-primary-800 no-underline outline-none transition-colors hover:text-primary-600 focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-3"
          >
            Ver todos los comunicados
            <i class="pi pi-arrow-right text-xs transition-transform group-hover:translate-x-0.5" aria-hidden="true"></i>
          </a>
        </header>

        <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          @for (entry of visualItems(); track entry.item.id) {
            <article class="min-w-0">
              <a
                [routerLink]="['/communications', entry.item.id]"
                [attr.aria-label]="'Leer comunicado: ' + entry.item.reference"
                class="group flex h-full min-h-[32rem] flex-col overflow-hidden rounded-2xl border no-underline outline-none transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-surface-950/10 focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-3 motion-reduce:transform-none motion-reduce:transition-none"
                [class]="entry.tone.surface + ' ' + entry.tone.border"
              >
                <div class="relative flex h-72 shrink-0 items-center justify-center overflow-hidden border-b border-surface-200/80 bg-surface-100 p-4 sm:h-80 xl:h-72">
                  @if (entry.item.previewUrl) {
                    <img
                      [src]="entry.item.previewUrl"
                      [alt]="'Vista previa de ' + entry.item.reference"
                      class="h-full w-full rounded-sm object-contain drop-shadow-[0_10px_10px_rgb(15_23_42/0.16)] transition-transform duration-200 group-hover:scale-[1.012] motion-reduce:transform-none motion-reduce:transition-none"
                      loading="lazy"
                      decoding="async"
                      (error)="markImageAsFailed(entry.item.id)"
                    />
                  } @else {
                    <div
                      class="flex aspect-[8.5/11] h-full max-w-full flex-col rounded-sm border border-surface-200 bg-white px-5 py-6 shadow-lg shadow-surface-950/10"
                      aria-label="Vista previa no disponible"
                    >
                      <div class="h-1 w-10 rounded-full bg-primary-600" aria-hidden="true"></div>
                      <div class="mt-7 space-y-2" aria-hidden="true">
                        <div class="h-1.5 w-4/5 rounded-full bg-surface-200"></div>
                        <div class="h-1.5 w-full rounded-full bg-surface-100"></div>
                        <div class="h-1.5 w-3/5 rounded-full bg-surface-100"></div>
                      </div>
                      <div class="mt-auto text-center text-surface-400" aria-hidden="true">
                        <i class="pi pi-file-pdf text-4xl"></i>
                      </div>
                    </div>
                  }
                </div>

                <div class="flex flex-1 flex-col p-5">
                  <div class="flex min-w-0 flex-wrap items-center gap-2">
                    <span
                      class="max-w-full truncate rounded-md px-2.5 py-1 text-[0.68rem] font-extrabold tracking-[0.08em] uppercase"
                      [class]="entry.tone.badge"
                    >
                      {{ entry.item.typeName }}
                    </span>
                    @if (entry.item.code) {
                      <span class="min-w-0 truncate text-xs font-semibold text-surface-600" [title]="entry.item.code">
                        {{ entry.item.code }}
                      </span>
                    }
                  </div>

                  <h3 class="mt-4 line-clamp-3 text-lg font-bold leading-6 text-surface-950" [title]="entry.item.reference">
                    {{ entry.item.reference }}
                  </h3>

                  <time
                    class="mt-3 text-xs font-medium text-surface-600"
                    [attr.datetime]="entry.item.createdAt"
                  >
                    {{ entry.item.createdAt | date: 'dd MMMM yyyy' }}
                  </time>

                  <span
                    class="mt-auto inline-flex items-center gap-2 border-t border-surface-900/8 pt-4 text-sm font-bold"
                    [class]="entry.tone.action"
                  >
                    Leer comunicado
                    <i class="pi pi-arrow-right text-xs transition-transform group-hover:translate-x-0.5" aria-hidden="true"></i>
                  </span>
                </div>
              </a>
            </article>
          }
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingCommunicationsSection {
  readonly items = input.required<PortalCommunicationResponse[]>();
  readonly failedImages = signal<ReadonlySet<string>>(new Set<string>());

  readonly visualItems = computed(() =>
    this.items()
      .slice(0, 4)
      .map((item) => ({ item, tone: communicationTone(item.typeName) })),
  );

  markImageAsFailed(id: string): void {
    this.failedImages.update((failedImages) => new Set(failedImages).add(id));
  }
}
